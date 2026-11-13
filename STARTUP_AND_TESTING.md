# 🚀 SHOPVIA - STARTUP & TESTING GUIDE

## Local Configuration

Razorpay is disabled by default, so local startup does not require gateway credentials. The local profile generates a temporary JWT key automatically; tokens expire when the backend restarts. Configure `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` if your MySQL settings differ from the defaults. Rotate credentials previously committed to this repository.

---

## 📋 STEP 1: PREPARE DATABASE

Use the existing `ecommerce_db` if it contains your old data. Back it up before startup; Hibernate is configured to update the schema, not recreate/drop the database. Do not import `sample_data.sql` into the existing database because it inserts demo rows. For a new empty local database only, create it with:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- Verify tables exist (Hibernate will auto-create)
-- The following tables will be created automatically:
-- - user
-- - product
-- - cart
-- - order
-- - order_item
-- - payment
```

---

## 🏃 STEP 2: START BACKEND

**Open PowerShell/Terminal 1:**

```powershell
# Navigate to project directory
cd C:\Users\91900\eclipse-workspace\EnterpriseEcommerce

# Start using the repository Maven wrapper
.\mvnw.cmd spring-boot:run
```

**Wait for message:**
```
Started EnterpriseEcommerceApplication in X seconds
```

**Backend running on:** `http://localhost:8080`

To enable Razorpay, set `RAZORPAY_ENABLED=true`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` before starting the backend, and configure `VITE_RAZORPAY_KEY_ID` in `ecommerce-frontend/.env.local`.

---

## 🎨 STEP 3: START FRONTEND

**Open PowerShell/Terminal 2:**

```powershell
# Navigate to frontend directory
cd ecommerce-frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

**Frontend running on:** `http://localhost:5173`

---

## 👤 STEP 4: CREATE TEST USERS

Open MySQL and run:

```sql
USE ecommerce_db;

-- Create Test Customer
INSERT INTO user (name, email, password, phone, role) 
VALUES (
  'John Doe',
  'john@example.com',
  '$2a$10$slYQmyNdGzIn9KqQ.v.P9OPST9/PgBkqquzi.Ss74oGO8XrqnHJiu',
  '9876543210',
  'USER'
);

-- Create Admin User
INSERT INTO user (name, email, password, phone, role) 
VALUES (
  'Admin User',
  'admin@shopvia.com',
  '$2a$10$slYQmyNdGzIn9KqQ.v.P9OPST9/PgBkqquzi.Ss74oGO8XrqnHJiu',
  '9333333333',
  'ADMIN'
);

-- Note: Password hash above is for "Test@123" 
-- You can use any password, but remember to update it with proper hashing

COMMIT;
```

---

## 📦 STEP 5: ADD SAMPLE PRODUCTS WITH IMAGES

### Option A: Using SQL (Quick)

```sql
USE ecommerce_db;

-- Product 1: Wireless Headphones
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Premium Wireless Headphones',
  'High-quality noise-cancelling Bluetooth headphones with 30-hour battery life',
  3999,
  50,
  'Electronics',
  'headphones.jpg'
);

-- Product 2: USB-C Cable
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Fast Charging USB-C Cable',
  '2-pack of durable USB-C charging cables with fast charging support',
  399,
  200,
  'Accessories',
  'usb-cable.jpg'
);

-- Product 3: Phone Case
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Premium Leather Phone Case',
  'Protective leather phone case with card slots',
  899,
  75,
  'Accessories',
  'phone-case.jpg'
);

-- Product 4: Screen Protector
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Tempered Glass Screen Protector',
  'Crystal clear tempered glass screen protector set (3 pack)',
  299,
  300,
  'Accessories',
  'screen-protector.jpg'
);

-- Product 5: Laptop Stand
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Adjustable Aluminum Laptop Stand',
  'Premium adjustable laptop stand for better posture and cooling',
  1799,
  40,
  'Home & Living',
  'laptop-stand.jpg'
);

-- Product 6: Wireless Mouse
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Ergonomic Wireless Mouse',
  'Comfortable ergonomic wireless mouse with precision tracking',
  799,
  120,
  'Accessories',
  'wireless-mouse.jpg'
);

-- Product 7: USB Hub
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  '7-Port USB Hub',
  'Multi-port USB 3.0 hub with power adapter',
  1299,
  60,
  'Electronics',
  'usb-hub.jpg'
);

-- Product 8: Phone Mount
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Adjustable Phone Mount for Car',
  'Universal car phone mount with strong grip',
  499,
  90,
  'Accessories',
  'phone-mount.jpg'
);

-- Product 9: Keyboard
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  'Mechanical Gaming Keyboard',
  'RGB mechanical keyboard with switches and programmable keys',
  2499,
  35,
  'Electronics',
  'keyboard.jpg'
);

-- Product 10: Webcam
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES (
  '1080p USB Webcam',
  'Full HD webcam for video calls and streaming',
  1599,
  45,
  'Electronics',
  'webcam.jpg'
);

COMMIT;
```

---

## 🖼️ STEP 6: ADD PRODUCT IMAGES

### Create Images Directory:

1. Navigate to backend: `C:\Users\91900\eclipse-workspace\EnterpriseEcommerce`
2. Create folder: `src/main/resources/static/images`
3. Add image files with these names:
   - `headphones.jpg`
   - `usb-cable.jpg`
   - `phone-case.jpg`
   - `screen-protector.jpg`
   - `laptop-stand.jpg`
   - `wireless-mouse.jpg`
   - `usb-hub.jpg`
   - `phone-mount.jpg`
   - `keyboard.jpg`
   - `webcam.jpg`

### Where to Get Images:

Download free images from:
- **Unsplash:** https://unsplash.com
- **Pexels:** https://pexels.com
- **Pixabay:** https://pixabay.com

Search for: "headphones", "usb cable", "phone case", etc.

### Quick Image Setup:

Or use placeholder commands:
```bash
# Navigate to images folder
cd C:\Users\91900\eclipse-workspace\EnterpriseEcommerce\src\main\resources\static\images

# Create dummy image files (they'll work for testing)
# On Windows, you can just create empty files with these names
```

---

## 🧪 STEP 7: TESTING FLOW

### TEST 1: Customer Registration

1. Open http://localhost:5173
2. Click "Create account"
3. Fill form:
   - **Name:** John Doe
   - **Email:** john@example.com
   - **Password:** Test@123
   - **Phone:** 9876543210
4. Click "Sign up"
5. Should see success message

### TEST 2: Customer Login

1. Click "Back to Sign In"
2. Enter email and password:
   - **Email:** john@example.com
   - **Password:** Test@123
3. Click "Sign In"
4. Should see home page with products

### TEST 3: Browse Products

1. After login, scroll down to see product grid
2. You should see all 10 products with:
   - Product image
   - Product name
   - Price
   - "+" button to add to cart

### TEST 4: Add to Cart

1. Click "+" button on any product
2. You'll see success message
3. Notice cart badge (top right) shows quantity
4. Click cart icon to view cart

### TEST 5: Checkout with COD

1. Click "Cart" button (top right)
2. Click "Proceed to Checkout"
3. Fill delivery details:
   - **Full Name:** John Doe
   - **Phone:** 9876543210
   - **Address:** 123 Main Street, Apt 4B
   - **City:** Mumbai
   - **Pincode:** 400001
4. Select **"Cash on Delivery"**
5. Click "Place Order"
6. See success page with order details

### TEST 6: Checkout with Razorpay

1. Add product to cart again
2. Go to checkout
3. Fill delivery details (same as above)
4. Select **"Online Payment"**
5. Click "Place Order"
6. Razorpay popup opens
7. Use test card: **4111 1111 1111 1111**
8. Enter any future date and any CVV
9. Click "Pay"
10. See payment success page

### TEST 7: Admin Access

1. Logout (click 🚪 button)
2. Login with admin:
   - **Email:** admin@shopvia.com
   - **Password:** Test@123
3. Should see admin dashboard (if implemented)
4. View statistics, products, orders, payments

### TEST 8: Theme Toggle

1. Login as any user
2. Click moon/sun icon (🌙/☀️) in top-right navbar
3. Theme should toggle between dark and light
4. Refresh page - theme should persist

### TEST 9: Admin Product Management

1. Login as admin
2. Navigate to Products
3. View all products (should see your 10 products)
4. Try adding new product
5. Try updating stock
6. Try deleting product (with confirmation)

---

## 📊 VERIFYING DATABASE

Open MySQL and verify:

```sql
USE ecommerce_db;

-- Check users
SELECT * FROM user;

-- Check products
SELECT * FROM product;

-- Check tables
SHOW TABLES;

-- Check product count
SELECT COUNT(*) as total_products FROM product;

-- Check low stock products
SELECT name, quantity FROM product WHERE quantity <= 10;
```

---

## ⚠️ COMMON ISSUES & FIXES

### Issue: "Cannot connect to MySQL"
```bash
# Check if MySQL is running
# Windows Services > MySQL80 > Start
# Or in terminal:
net start MySQL80
```

### Issue: "Products not showing"
```bash
# Clear browser cache
# Press F12 > Storage > Clear All
# Refresh page
```

### Issue: "Razorpay checkout not opening"
```bash
# Check browser console (F12)
# Verify key is correct
# Ensure Razorpay script loaded
# Check network tab for errors
```

### Issue: "Payment verification failed"
```bash
# Check backend logs for error
# Ensure credentials are correct
# Verify signature verification in PaymentService
```

### Issue: "Admin dashboard not accessible"
```sql
-- Verify admin user has correct role
SELECT * FROM user WHERE email = 'admin@shopvia.com';
-- Should show role = 'ADMIN'
```

---

## 🎯 TEST CHECKLIST

### Customer Flow
- [ ] Register new account
- [ ] Login successfully
- [ ] Browse products
- [ ] Add product to cart
- [ ] View cart
- [ ] Update cart quantity
- [ ] Checkout with COD
- [ ] Checkout with Razorpay (test card)
- [ ] View order confirmation
- [ ] View order history
- [ ] Toggle dark/light theme

### Admin Flow
- [ ] Login as admin
- [ ] View dashboard statistics
- [ ] Add new product
- [ ] View all products
- [ ] Update product stock
- [ ] Delete product
- [ ] View all orders
- [ ] Update order status
- [ ] View payment records

---

## 📱 API TESTING (Optional)

### Using cURL or Postman:

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test@123"}'

# Get Products
curl -X GET http://localhost:8080/api/products

# Get Cart
curl -X GET http://localhost:8080/api/cart/1 \
  -H "Authorization: Bearer {token}"

# Place Order
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"userId":1}'
```

---

## 🎉 READY TO TEST!

Everything is set up! Follow the steps above to:
1. ✅ Start backend (Terminal 1)
2. ✅ Start frontend (Terminal 2)
3. ✅ Create test users
4. ✅ Add 10 sample products
5. ✅ Add product images
6. ✅ Test customer flow
7. ✅ Test admin flow
8. ✅ Test Razorpay payment

---

## 📞 SUPPORT

If you encounter issues:
1. Check browser console (F12)
2. Check backend logs in Terminal 1
3. Verify database connection
4. Ensure MySQL is running
5. Check Razorpay credentials

**Happy Testing! 🚀**
