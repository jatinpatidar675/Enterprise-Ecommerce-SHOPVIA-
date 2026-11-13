# 🎯 SHOPVIA - QUICK START CHECKLIST

## Razorpay
Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `VITE_RAZORPAY_KEY_ID` locally. Rotate previously committed credentials.

---

## 🚀 3-STEP QUICK START

### Step 1: Start MySQL & Create Database
```bash
net start MySQL80
mysql -u root -p
CREATE DATABASE IF NOT EXISTS ecommerce_db;
EXIT;
```

### Step 2: Add Sample Products & Users
```bash
cd C:\Users\91900\eclipse-workspace\EnterpriseEcommerce
mysql -u root -p ecommerce_db < sample_data.sql
```

### Step 3: Start Backend & Frontend
**Option A - Automated (Easiest):**
```bash
# Double-click:
C:\Users\91900\eclipse-workspace\EnterpriseEcommerce\START_SHOPVIA.bat
```

**Option B - Manual:**

Terminal 1:
```bash
cd C:\Users\91900\eclipse-workspace\EnterpriseEcommerce
mvn clean install -DskipTests
mvn spring-boot:run
```

Terminal 2:
```bash
cd C:\Users\91900\eclipse-workspace\EnterpriseEcommerce\ecommerce-frontend
npm install
npm run dev
```

---

## 🖼️ ADD PRODUCT IMAGES

1. Create folder: `src\main\resources\static\images\`
2. Download images from Unsplash/Pexels with these names:
   - headphones.jpg
   - usb-cable.jpg
   - phone-case.jpg
   - screen-protector.jpg
   - laptop-stand.jpg
   - wireless-mouse.jpg
   - usb-hub.jpg
   - phone-mount.jpg
   - keyboard.jpg
   - webcam.jpg
   - screen-cleaner.jpg
   - power-bank.jpg

3. Copy images to: `C:\Users\91900\eclipse-workspace\EnterpriseEcommerce\src\main\resources\static\images\`

---

## 🔐 TEST CREDENTIALS

### Customer
- Email: `john@example.com`
- Password: `Test@123`

### Admin
- Email: `admin@shopvia.com`
- Password: `Test@123`

---

## 💳 RAZORPAY TEST CARD

- Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

---

## 🌐 AFTER STARTUP

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8080 |
| Products | http://localhost:8080/api/products |

---

## ✅ TESTING CHECKLIST

- [ ] MySQL is running
- [ ] Sample data loaded
- [ ] Backend started on 8080
- [ ] Frontend started on 5173
- [ ] Product images in static/images folder
- [ ] Login with john@example.com works
- [ ] Can add products to cart
- [ ] COD checkout works
- [ ] Razorpay test card works (4111 1111 1111 1111)
- [ ] Admin login works (admin@shopvia.com)
- [ ] Admin can add/delete products
- [ ] Theme toggle works (🌙/☀️)

---

## 📚 DOCUMENTATION

Read these for detailed instructions:
- `COMPLETE_SETUP_GUIDE.md` - Full setup guide
- `STARTUP_AND_TESTING.md` - Detailed testing steps
- `IMPLEMENTATION_REPORT.md` - Technical details
- `QUICK_START_GUIDE.md` - Reference guide

---

## 🎉 READY TO GO!

Everything is configured. Just follow the 3 steps above and you'll have ShopVia running!
