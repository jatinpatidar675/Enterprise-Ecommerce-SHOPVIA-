# ShopVia Project Audit

**Audit date:** 2026-11-11  
**Scope:** Initial focused review of application configuration, authentication/security, core controllers and services, checkout/payment, customer/admin entry points, and existing tests. This is not a line-by-line review of every source and CSS file. Database-backed business workflows and responsive/browser checks remain unverified.

This report supersedes earlier setup/completion documents that described the project as fully tested or production-ready. A feature is not marked WORKING solely because its component or endpoint exists.

## Audit Checklist

| Feature | Status | Problem found / required fix | Test result |
|---|---|---|---|
| Backend and frontend compilation | WORKING | Java sources compile and the React production build succeeds; this does not verify runtime integrations. | Maven compile, Vite build, and ESLint pass. |
| Registration and password storage | PARTIALLY WORKING | Passwords are encoded and self-registration now forces `USER`; full request validation still needs work. | H2 regression test confirms role forcing, hashing, and password omission from JSON. |
| Login and JWT | PARTIALLY WORKING | JWT filter is registered. Local mode generates an ephemeral key; non-local profiles still require a configured strong key. Token expiry and full API role behavior need integration tests. | Regression tests cover local ephemeral signing and production missing-key rejection. |
| Logout | PARTIALLY WORKING | Client clears local state; JWT is stateless and has no server-side revocation. | Source reviewed; browser test not run. |
| User data exposure | PARTIALLY WORKING | Password values are write-only in JSON and user-by-ID access is owner/admin scoped. The entity remains the request/response model. | H2 regression test confirms owner/admin access behavior. |
| Profile view/update | NOT IMPLEMENTED | Profile fetch exists; no profile update endpoint was found. Add validated owner-only update support. | Not tested. |
| Product listing/details | PARTIALLY WORKING | Public list/detail endpoints and frontend display exist; live database and image behavior were not exercised. | Frontend build/lint pass only. |
| Product search/filter/sort | PARTIALLY WORKING | Frontend controls exist, but no end-to-end search/filter/sort API test was available. | Not tested against data. |
| Cart add/update/remove | PARTIALLY WORKING | Owner/admin checks now protect add, list, update, and remove operations. Stock behavior and API flows still need integration tests. | Compile pass; controller/database flow not tested. |
| Checkout API contract | PARTIALLY WORKING | Both checkout flows called a nonexistent `POST /orders`; they now call `POST /orders/place?userId=...`, matching the controller. | Frontend build passes; API call not run. |
| COD payment | PARTIALLY WORKING | Payment endpoint exists, but authenticated callers can supply arbitrary IDs and order creation is not verified end to end. | Not tested. |
| Razorpay payment | NOT WORKING | Request amount/user/order values are client supplied; order creation consumes stock and clears the cart before payment; verification does not bind the payment to the authenticated owner/order or advance order status. Implement server-calculated amounts, atomic pending-order/payment states, idempotency, and failure/cancel recovery. | Credentials are optional for local startup; gateway flow remains untested. |
| Order history/details/status | PARTIALLY WORKING | Owner/admin checks now protect order reads; state mutations are admin-only but lack workflow validation. | Compile pass; controller/database flow not tested. |
| Admin product/order/payment screens | PARTIALLY WORKING | Existing admin components are now mounted in an admin workspace and the entry is shown for `ADMIN` accounts. Backend remains the authorization boundary; data workflows need a running API. | Frontend admin shell opened in browser; API displayed connection error because backend was not running. |
| Admin dashboard analytics | NOT IMPLEMENTED | Current dashboard calculates a few totals client-side; customer/status counts and sales/monthly/category charts are absent. | Static source review. |
| Customer management | NOT IMPLEMENTED | No dedicated admin customer view/details/orders workflow was found. | Static source review. |
| Product image upload/category/pagination | NOT IMPLEMENTED | No image-upload or category-management API was found; product listing pagination was not found. | Static source review. |
| Inventory and cancellation recovery | PARTIALLY WORKING | Order placement decrements stock, and refund status may restore it; payment failures/cancellations and repeated status changes are not safely coordinated. | Not tested. |
| Dark/light theme | PARTIALLY WORKING | Centralized state and pre-paint restoration now apply across storefront, auth, customer pages, and admin shell. Some legacy page-specific colors remain to review. | Browser verified light login, persisted reload, theme control, and admin shell; full page-by-page contrast test remains. |
| Responsive UI and accessibility | PARTIALLY WORKING | Admin nav adapts to mobile and the login/admin shells fit a 375px viewport. Other views, keyboard, and assistive-technology behavior remain unverified. | Browser measured no horizontal overflow on login/admin shells at 375px. |
| Environment/security configuration | PARTIALLY WORKING | Existing `ecommerce_db` is the default target; the PowerShell launcher prompts for its password without storing it. Local JWT is ephemeral and Razorpay is disabled by default; production requires explicit secrets. Previously exposed credentials must be rotated because they may remain in Git history. | Tests pass; launch scripts use the wrapper and preserve the existing database target. |

## Changes Made During This Audit

- Replaced literal database and Razorpay configuration values with `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` environment variables.
- Removed the hardcoded Razorpay checkout key and removed exposed credentials/password arguments from setup guides and startup scripts.
- Replaced the hardcoded JWT signing key with `JWT_SECRET`, rejecting keys shorter than 32 bytes.
- Generate a cryptographically random ephemeral JWT key in the local profile; require a stable key in non-local profiles.
- Made Razorpay bean creation opt-in so missing gateway credentials do not prevent local startup; payment calls return HTTP 503 until configured.
- Updated Windows launchers to use the Maven wrapper, local paths, a secure MySQL password prompt, and no fixed wait.
- Registered the JWT filter, denied unmatched routes, required authentication for customer APIs, and restricted admin APIs plus order/payment state changes to admins.
- Forced self-registration to `USER` and prevented serialized `User` responses from exposing password values.
- Corrected both checkout order-creation URLs to match the existing backend endpoint.
- Added a checkout guard so a missing Razorpay public key is reported before an order is created.
- Replaced Vite's conflicting global color scheme/root sizing with the ShopVia theme tokens and restore the saved theme before first render.
- Added a reusable theme switch on standalone screens and mounted the existing admin views behind an admin-role entry.

## Verification

- `npm --prefix ecommerce-frontend run build`: passed.
- `npm --prefix ecommerce-frontend run lint`: passed.
- `mvnw.cmd --batch-mode -DskipTests compile`: passed.
- `mvnw.cmd --batch-mode test`: passed, 6 tests, using test-only in-memory H2. Embedded Tomcat starts under the local profile with an empty JWT secret; tests also cover registration role/password behavior, owner/admin access checks, and production JWT-key enforcement. They do not prove MySQL compatibility or end-to-end flows.
- Browser checks confirmed theme persistence and no horizontal overflow for the login/admin shells at 375px. Razorpay, real login, database-backed customer flows, and admin API workflows remain untested.

## Required Environment

Local startup requires MySQL with `ecommerce_db`; configure `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` only when the defaults do not match your installation. `JWT_SECRET` is generated temporarily for the local profile, so tokens become invalid after a restart. Razorpay is disabled by default; set `RAZORPAY_ENABLED=true`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` to enable it. Production must provide a stable `JWT_SECRET` of at least 32 UTF-8 bytes. The frontend uses `VITE_API_ORIGIN` and reads `VITE_RAZORPAY_KEY_ID` at build time. Rotate all credentials previously committed or shared; deleting them from the working tree does not invalidate Git history.

## Run and Test

Create the `ecommerce_db` MySQL database first. For a local database with the default root/blank-password settings, no backend secrets are needed. To use different MySQL credentials, set them in PowerShell before starting:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/ecommerce_db"
$env:DB_USERNAME = "<your MySQL username>"
$env:DB_PASSWORD = "<your MySQL password>"
.\mvnw.cmd spring-boot:run
```

The app generates a temporary local JWT key automatically. To enable Razorpay, set `RAZORPAY_ENABLED=true`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` before launch, and set `VITE_RAZORPAY_KEY_ID` in the frontend `.env.local` file.

In another terminal, copy and edit the frontend environment file, then run:

```powershell
Copy-Item ecommerce-frontend/.env.example ecommerce-frontend/.env.local
npm --prefix ecommerce-frontend install
npm --prefix ecommerce-frontend run dev
```

Automated checks: `.\mvnw.cmd test`, `npm --prefix ecommerce-frontend run build`, and `npm --prefix ecommerce-frontend run lint`. Production database schema migrations have not been added; H2 is test-scope only, with no production schema change in this audit.

## Remaining Release Blockers

- Add controller/API-level authorization tests for owner checks across user, cart, order, and payment routes.
- Redesign order/payment lifecycle so totals are computed from persisted cart/product data, stock/cart mutations happen safely, failed payments recover cleanly, and successful verification updates the corresponding order exactly once.
- Add backend integration/security tests with an isolated test database and frontend tests for customer/admin workflows.
- Implement profile editing, customer administration, image upload/category/pagination, and meaningful dashboard charts if these remain product requirements.
- Run browser-based responsive/theme/accessibility checks and deploy with production CORS, HTTPS, secrets management, database migrations, and operational monitoring.