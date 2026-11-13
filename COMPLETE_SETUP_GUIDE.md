# 🚀 SHOPVIA - COMPLETE SETUP & RUN GUIDE

## Razorpay Configuration

Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `VITE_RAZORPAY_KEY_ID` in your local environment. Never commit gateway credentials. Rotate any credentials previously stored in this repository.

---

## 📋 QUICK START (3 STEPS)

### STEP 1️⃣: Start MySQL & Create Database

```bash
# Open PowerShell as Administrator
net start MySQL80

# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE IF NOT EXISTS ecommerce_db;
EXIT;
```

### STEP 2️⃣: Add Sample Data to Database

**Option A - Using Automated SQL Script:**

```bash
# Navigate to project directory
cd C:\Users\91900\eclipse-workspace\EnterpriseEcommerce

# Import sample data
mysql -u root -p ecommerce_db < sample_data.sql
```

**Option B - Manual SQL Entry:**

```bash
mysql -u root -p ecommerce_db < sample_data.sql
```

This will create:
- ✅ 2 test users (John Doe, Admin)
- ✅ 12 sample products
- ✅ All with proper categories and prices

### STEP 3️⃣: Start Backend & Frontend

**Using the Startup Script (RECOMMENDED):**

```bash
# Double-click this file:
C:\Users\91900\eclipse-workspace\EnterpriseEcommerce\START_SHOPVIA.bat

# OR for PowerShell users:
C:\Users\91900\eclipse-workspace\EnterpriseEcommerce\START_SHOPVIA.ps1
```

**OR Manual Start:**

**Terminal 1 - Backend:**
```bash
cd C:\Users\91900\eclipse-workspace\EnterpriseEcommerce
mvn clean install -DskipTests
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\91900\eclipse-workspace\EnterpriseEcommerce\ecommerce-frontend
npm install
npm run dev
```

---

## 🖼️ ADD PRODUCT IMAGES (IMPORTANT!)

For products to display correctly, you need to add images:

### Step 1: Create Images Folder

```
Create folder:
C:\Users\91900\eclipse-workspace\EnterpriseEcommerce
  └─ src\main\resources\static\images\
```

### Step 2: Download Free Product Images

From **Unsplash**, **Pexels**, or **Pixabay**, download these images:

| Product | Search Query | Filename |
|---------|--------------|----------|
| Headphones | "wireless headphones" | headphones.jpg |
| USB Cable | "usb-c cable" | usb-cable.jpg |
| Phone Case | "phone case leather" | phone-case.jpg |
| Screen Protector | "screen protector" | screen-protector.jpg |
| Laptop Stand | "laptop stand" | laptop-stand.jpg |
| Wireless Mouse | "wireless mouse" | wireless-mouse.jpg |
| USB Hub | "usb hub" | usb-hub.jpg |
| Phone Mount | "car phone mount" | phone-mount.jpg |
| Keyboard | "gaming keyboard" | keyboard.jpg |
| Webcam | "usb webcam" | webcam.jpg |
| Screen Cleaner | "screen cleaner" | screen-cleaner.jpg |
| Power Bank | "power bank" | power-bank.jpg |

### Step 3: Place Images in Folder

Copy all downloaded images to:
```
C:\Users\91900\eclipse-workspace\EnterpriseEcommerce\src\main\resources\static\images\
```

---

## 🧪 TESTING AFTER STARTUP

### ✅ Check Backend is Running

Open browser and visit: http://localhost:8080/api/products

You should see JSON list of products.

### ✅ Check Frontend is Running

Open browser and visit: http://localhost:5173

You should see ShopVia home page.

### ✅ Verify Database

```bash
mysql -u root -p ecommerce_db
SHOW TABLES;
SELECT COUNT(*) FROM product;
SELECT COUNT(*) FROM user;
EXIT;
```

---

## 🎯 COMPLETE TESTING FLOW

### Test 1: Customer Registration

1. Go to http://localhost:5173
2. Click "Create account"
3. Register with any credentials
4. Login with same credentials
5. ✅ Should see product grid

### Test 2: Browse & Add Products to Cart

1. Scroll down to see products
2. Click "+" on any product
3. See success message
4. Cart badge updates (top right)
5. ✅ Try adding multiple products

### Test 3: Checkout with Cash on Delivery

1. Click Cart icon
2. Click "Proceed to Checkout"
3. Fill delivery details:
   - Full Name: John Doe
   - Phone: 9876543210
   - Address: 123 Main St
   - City: Mumbai
   - Pincode: 400001
4. Select **"Cash on Delivery"**
5. Click "Place Order"
6. ✅ See success page

### Test 4: Checkout with Razorpay

1. Add another product
2. Go to Checkout
3. Fill delivery details (same as above)
4. Select **"Online Payment"**
5. Click "Place Order"
6. **Razorpay popup opens**
7. Use test card: **4111 1111 1111 1111**
8. Any future expiry date
9. Any 3-digit CVV
10. Click "Pay"
11. ✅ See payment success confirmation

### Test 5: Admin Dashboard

1. Logout (click 🚪 button)
2. Login with admin credentials:
   - Email: admin@shopvia.com
   - Password: Test@123
3. Dashboard should show:
   - Total Products: 12
   - Total Stock: (sum of all products)
   - Total Orders: (based on your orders)
   - Total Revenue: (based on successful payments)
4. ✅ Navigate admin menu to verify features

### Test 6: Admin Features

- ✅ View Products
- ✅ Add new product
- ✅ Update stock
- ✅ Delete product
- ✅ View Orders
- ✅ Update order status
- ✅ View Payments

### Test 7: Theme Toggle

1. Click 🌙 or ☀️ button (top navbar)
2. Theme should switch instantly
3. Refresh page
4. ✅ Theme should persist

---

## 📊 SAMPLE DATA INCLUDED

### Test Users Created:

```
Customer:
Email: john@example.com
Password: Test@123

Admin:
Email: admin@shopvia.com
Password: Test@123

Additional:
Email: alice@example.com / bob@example.com
Password: Test@123 (for all)
```

### Products Created:

```
1. Premium Wireless Headphones - ₹3,999 (50 stock)
2. Fast Charging USB-C Cable - ₹399 (200 stock)
3. Premium Leather Phone Case - ₹899 (75 stock)
4. Tempered Glass Screen Protector - ₹299 (300 stock)
5. Adjustable Aluminum Laptop Stand - ₹1,799 (40 stock)
6. Ergonomic Wireless Mouse - ₹799 (120 stock)
7. 7-Port USB Hub - ₹1,299 (60 stock)
8. Adjustable Phone Mount for Car - ₹499 (90 stock)
9. Mechanical Gaming Keyboard - ₹2,499 (35 stock)
10. 1080p USB Webcam - ₹1,599 (45 stock)
11. Premium Screen Cleaner Kit - ₹399 (150 stock)
12. Portable Phone Charger 20000mAh - ₹1,499 (80 stock)
```

---

## ⚠️ TROUBLESHOOTING

### Issue: "Cannot connect to MySQL"
```bash
# Check MySQL status
status = net stop MySQL80
status = net start MySQL80

# Verify connection
mysql -u root -p -e "SELECT 1"
```

### Issue: "Products not showing on frontend"
1. Ensure backend is running on localhost:8080
2. Check browser console for errors (F12)
3. Open DevTools Network tab
4. Call: http://localhost:8080/api/products
5. Verify JSON response with products

### Issue: "Images not displaying"
1. Verify images folder exists:
   `src/main/resources/static/images/`
2. Ensure image filenames match database
3. Restart backend after adding images
4. Clear browser cache (Ctrl+Shift+Delete)

### Issue: "Razorpay popup not opening"
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify Razorpay script loaded
4. Check Network tab for checkout.razorpay.com
5. Verify key ID is correct

### Issue: "Payment verification failed"
1. Check backend logs
2. Verify Razorpay credentials are correct
3. Ensure payment signature verification works
4. Test with correct test card

### Issue: "Admin page not accessible"
1. Verify user has role='ADMIN' in database
2. Login again after database update
3. Check backend authorization logs
4. Verify SecurityConfig has admin endpoint

---

## 🔑 KEY URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | ShopVia Web App |
| Backend | http://localhost:8080 | REST API |
| Products API | http://localhost:8080/api/products | Get all products |
| Cart API | http://localhost:8080/api/cart/1 | Get user cart |
| Orders API | http://localhost:8080/api/orders | Get user orders |
| Payments API | http://localhost:8080/api/payments | Get payments |

---

## 📚 FILES CREATED FOR THIS SETUP

```
✅ application.properties (Razorpay credentials)
✅ CheckoutPage.jsx (Razorpay integration)
✅ STARTUP_AND_TESTING.md (Full testing guide)
✅ sample_data.sql (Sample products & users)
✅ START_SHOPVIA.bat (Windows batch startup script)
✅ START_SHOPVIA.ps1 (PowerShell startup script)
✅ THIS FILE (Complete setup guide)
```

---

## 🎯 NEXT STEPS

1. **✅ Ensure MySQL is running**
   ```bash
   net start MySQL80
   ```

2. **✅ Create database**
   ```bash
   mysql -u root -p ecommerce_db < sample_data.sql
   ```

3. **✅ Add product images to folder**
   - Download from Unsplash/Pexels
   - Place in `src/main/resources/static/images/`

4. **✅ Start using startup script**
   - Double-click `START_SHOPVIA.bat` or
   - Run `START_SHOPVIA.ps1` in PowerShell

5. **✅ Wait for both servers to start**
   - Backend: http://localhost:8080
   - Frontend: http://localhost:5173

6. **✅ Open http://localhost:5173 in browser**

7. **✅ Login and test!**
   ```
   Customer: john@example.com / Test@123
   Admin: admin@shopvia.com / Test@123
   ```

---

## 🎉 YOU'RE READY!

Everything is configured and ready to run. Follow the 3 quick start steps above and you'll have a fully functional e-commerce platform with:

✅ Product management  
✅ Shopping cart  
✅ Razorpay payment (with test credentials)  
✅ Admin dashboard  
✅ Dark/Light theme  
✅ 12 sample products  
✅ Test users  

**Enjoy testing ShopVia! 🚀**

---

## 📞 QUICK REFERENCE

**Start Backend:**
```bash
cd C:\Users\91900\eclipse-workspace\EnterpriseEcommerce
mvn spring-boot:run
```

**Start Frontend:**
```bash
cd C:\Users\91900\eclipse-workspace\EnterpriseEcommerce\ecommerce-frontend
npm run dev
```

**Add Sample Data:**
```bash
mysql -u root -p ecommerce_db < sample_data.sql
```

**Test Razorpay Card:**
```
4111 1111 1111 1111
Any future date
Any CVV
```

---

**Last Updated:** October 1, 2026  
**Status:** ✅ READY FOR FULL TESTING
