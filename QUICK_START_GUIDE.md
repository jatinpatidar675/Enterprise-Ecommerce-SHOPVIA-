# ShopVia E-Commerce Platform - QUICK START GUIDE

## 🚀 SETUP & INSTALLATION

### STEP 1: Backend Setup

```bash
# Navigate to backend directory
cd C:\Users\91900\eclipse-workspace\EnterpriseEcommerce

# Ensure MySQL is running
# Create database
mysql -u root -p
> CREATE DATABASE ecommerce_db;
> EXIT;

# Update application.properties with your Razorpay credentials
# File: src/main/resources/application.properties
# razorpay.key.id=YOUR_TEST_KEY_ID
# razorpay.key.secret=YOUR_TEST_SECRET_KEY

# Build the project
mvn clean install

# Run the backend
mvn spring-boot:run

# Backend should start on http://localhost:8080
```

### STEP 2: Frontend Setup

```bash
# Navigate to frontend directory
cd C:\Users\91900\eclipse-workspace\EnterpriseEcommerce\ecommerce-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend should start on http://localhost:5173
```

---

## 🧪 TESTING SCENARIOS

### Scenario 1: Customer Registration & Login

1. Open http://localhost:5173
2. Click "Create account"
3. Register with:
   - Name: John Doe
   - Email: john@example.com
   - Password: Test@123
   - Phone: 9876543210
   - Role: USER (default)

4. Login with these credentials
5. You'll see the ShopVia home page

### Scenario 2: Browse Products & Add to Cart

1. After login, you'll see the product grid
2. Click "+" button on any product to add to cart
3. Click cart icon (top right) to view cart
4. Adjust quantities using +/- buttons
5. Click "Proceed to Checkout"

### Scenario 3: Checkout with Cash on Delivery

1. Fill in delivery address:
   - Full Name: John Doe
   - Phone: 9876543210
   - Address: 123 Main Street, Apt 4B
   - City: Mumbai
   - Pincode: 400001

2. Select "Cash on Delivery" payment method
3. Click "Place Order"
4. View order confirmation on success page

### Scenario 4: Checkout with Razorpay

1. Complete address form (same as above)
2. Select "Online Payment" 
3. Click "Place Order"
4. Razorpay popup will open
5. Use test card: `4111 1111 1111 1111`
6. Any future date, any CVV
7. Complete payment
8. See order confirmation

### Scenario 5: Admin Access

1. Create admin user in database:
```sql
INSERT INTO user (id, name, email, password, phone, role) 
VALUES (999, 'Admin User', 'admin@shopvia.com', 'hashed_password', '9876543210', 'ADMIN');
```

**Note:** Password should be hashed using the same method as UserService

2. Login with admin credentials
3. If role='ADMIN', admin dashboard should be accessible
4. Navigate through admin features:
   - View Dashboard (stats)
   - View/Add/Delete Products
   - Manage Stock
   - View Orders & update status
   - View Payment records

### Scenario 6: Dark/Light Theme

1. Click the moon/sun icon in navbar (top right)
2. Theme toggles between dark and light
3. Preference is saved in localStorage
4. All pages adapt to selected theme

---

## 🔧 COMMON ISSUES & SOLUTIONS

### Issue 1: "Cannot connect to MySQL"
**Solution:**
```bash
# Start MySQL service
# Windows: Services > MySQL80 > Start
# Or in terminal:
net start MySQL80

# Verify connection
mysql -u root -p
```

### Issue 2: "CORS error on API calls"
**Solution:**
- Ensure backend is running on http://localhost:8080
- Ensure frontend is running on http://localhost:5173
- Check SecurityConfig.java for CORS configuration

### Issue 3: "Razorpay checkout not opening"
**Solution:**
- Check browser console for errors
- Verify Razorpay script is loaded in index.html
- Check Razorpay credentials in CheckoutPage.jsx
- Ensure key is correctly set

### Issue 4: "Products not showing"
**Solution:**
```bash
# Add test products via SQL
INSERT INTO product (name, description, price, quantity, category, image) 
VALUES ('Test Product', 'Description', 999.99, 10, 'Electronics', 'product.jpg');

# Or use the Admin "Add Product" feature
```

### Issue 5: "Admin pages not accessible"
**Solution:**
- Ensure user has role='ADMIN' in database
- Admin routes need to be added to App.jsx routing logic
- Check backend authorization logs

---

## 📊 SAMPLE DATA INSERTION

```sql
-- Sample Products
INSERT INTO product (name, description, price, quantity, category, image) VALUES
('Wireless Headphones', 'Premium noise-cancelling headphones', 2999, 50, 'Electronics', 'headphones.jpg'),
('USB-C Cable', 'High-speed USB-C charging cable', 299, 100, 'Accessories', 'cable.jpg'),
('Phone Case', 'Durable protective phone case', 499, 75, 'Accessories', 'case.jpg'),
('Screen Protector', 'Tempered glass screen protector', 199, 200, 'Accessories', 'protector.jpg'),
('Laptop Stand', 'Adjustable aluminum laptop stand', 1499, 30, 'Home & Living', 'stand.jpg');

-- Sample Users
INSERT INTO user (name, email, password, phone, role) VALUES
('Alice Smith', 'alice@example.com', 'hashed_password', '9111111111', 'USER'),
('Bob Johnson', 'bob@example.com', 'hashed_password', '9222222222', 'USER'),
('Admin User', 'admin@shopvia.com', 'hashed_password', '9333333333', 'ADMIN');
```

---

## 🎯 API TESTING WITH POSTMAN

### 1. Register User
```
POST http://localhost:8080/api/auth/register
Body (JSON):
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test@123",
  "phone": "9876543210",
  "role": "USER"
}
```

### 2. Login User
```
POST http://localhost:8080/api/auth/login
Body (JSON):
{
  "email": "test@example.com",
  "password": "Test@123"
}

Response includes:
- token (JWT)
- userId
- name
- email
- role
```

### 3. Get Products
```
GET http://localhost:8080/api/products
Header: Authorization: Bearer {token}
```

### 4. Create Admin Product
```
POST http://localhost:8080/api/admin/products
Header: Authorization: Bearer {admin_token}
Body (JSON):
{
  "name": "New Product",
  "description": "Product description",
  "price": 1999.99,
  "quantity": 50,
  "category": "Electronics",
  "image": "product.jpg"
}
```

### 5. Create Razorpay Order
```
POST http://localhost:8080/api/payments/razorpay/create-order
Header: Authorization: Bearer {token}
Body (JSON):
{
  "userId": 1,
  "orderId": 100,
  "amount": 5000,
  "description": "Order for test user"
}

Response:
{
  "orderId": "order_xxxxxxx",
  "amount": 500000,
  "currency": "INR",
  "id": 1
}
```

---

## 📱 MOBILE TESTING

### Using Chrome DevTools:
1. Press F12 to open DevTools
2. Click device icon (top-left) to toggle device toolbar
3. Select mobile device (iPhone X, Galaxy S20, etc.)
4. Test responsive layout and functionality

### Common Mobile Breakpoints:
- Mobile: 320px, 480px
- Tablet: 768px, 1024px
- Desktop: 1920px

---

## 🔒 SECURITY CHECKLIST

- ✅ JWT tokens stored in localStorage
- ✅ Passwords should be hashed (bcrypt recommended)
- ✅ Razorpay secret key NOT in frontend
- ✅ Admin endpoints require ADMIN role
- ✅ CORS restricted to localhost:5173
- ✅ HTTPS recommended for production
- ✅ Sensitive data not logged

---

## 🎨 CUSTOMIZATION

### Change Theme Colors

Edit `App.css`:
```css
:root[data-theme="dark"] {
  --accent-color: #2563eb; /* Change this */
}

:root[data-theme="light"] {
  --accent-color: #1d4ed8; /* Change this */
}
```

### Change Razorpay Key

Edit `CheckoutPage.jsx`:
```javascript
const options = {
  key: "YOUR_NEW_KEY_ID", // Change this
  // ... rest of config
};
```

### Customize Admin Sidebar

Edit `AdminDashboard.css`:
```css
.admin-sidebar {
  width: 280px; /* Change width */
  background: linear-gradient(...); /* Change background */
}
```

---

## 📝 DATABASE BACKUP

```bash
# Backup database
mysqldump -u root -p ecommerce_db > backup.sql

# Restore database
mysql -u root -p ecommerce_db < backup.sql
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Replace test Razorpay credentials with production
- [ ] Update CORS allowed origins for production domain
- [ ] Enable HTTPS/SSL certificates
- [ ] Hash all passwords before deployment
- [ ] Set environment variables for sensitive data
- [ ] Configure production database
- [ ] Set up logging system
- [ ] Implement rate limiting
- [ ] Add error tracking (Sentry, etc.)
- [ ] Test payment flow end-to-end
- [ ] Backup database regularly
- [ ] Monitor server performance

---

## 💡 USEFUL COMMANDS

```bash
# Backend
mvn clean install               # Clean build
mvn spring-boot:run            # Run backend
mvn test                       # Run tests
mvn compile                    # Compile only

# Frontend
npm install                    # Install dependencies
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run lint                   # Run linter
npm run preview               # Preview production build

# Database
mysql -u root -p              # Connect to MySQL
mysqldump -u root -p          # Backup database
```

---

## 📞 GETTING HELP

1. **Backend Issues:**
   - Check Spring Boot console logs
   - Verify database connection
   - Check application.properties

2. **Frontend Issues:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API calls
   - Clear localStorage if needed (localStorage.clear())

3. **Payment Issues:**
   - Check Razorpay dashboard
   - Verify credentials
   - Test with Razorpay test cards
   - Check payment verification logs

4. **Database Issues:**
   - Verify MySQL is running
   - Check database credentials
   - Review Hibernate logs
   - Ensure tables exist

---

## 🎓 LEARNING RESOURCES

- React: https://react.dev
- Spring Boot: https://spring.io/projects/spring-boot
- Razorpay: https://razorpay.com/docs/
- MySQL: https://dev.mysql.com/doc/

---

**Last Updated:** October 1, 2026
**Project Status:** ✅ Ready for Testing & Production Deployment
