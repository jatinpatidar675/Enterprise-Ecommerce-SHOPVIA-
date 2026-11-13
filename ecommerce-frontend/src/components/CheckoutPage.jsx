import "./CheckoutPage.css";
import { useState } from "react";
import API, { getProductImageUrl } from "../api";
import DeliveryLocationMap from "./DeliveryLocationMap";

function CheckoutPage({
  cartItems = [],
  products = [],
  onBackToCart,
  onOrderSuccess,
  userId,
  formatPrice: priceFormatter,
}) {
  // =====================================================
  // SAFE CART ARRAY
  // =====================================================

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  // =====================================================
  // ADDRESS STATE
  // =====================================================

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    houseNumber: "",
    address: "",
    city: "",
    pincode: "",
  });

  // =====================================================
  // PAYMENT STATE
  // =====================================================

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [pendingDeliveryLocation, setPendingDeliveryLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationError, setLocationError] = useState("");

  // =====================================================
  // VALIDATION ERRORS
  // =====================================================

  const [errors, setErrors] = useState({});

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = priceFormatter || ((price) => {
    return Number(price || 0).toLocaleString("en-IN");
  });

  // =====================================================
  // GET PRODUCT
  // =====================================================

  const getProductById = (productId) => {
    return products.find(
      (product) => Number(product.id) === Number(productId)
    );
  };

  // =====================================================
  // TOTAL ITEMS
  // =====================================================

  const totalItems = safeCartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  // =====================================================
  // SUBTOTAL
  // =====================================================

  const subtotal = safeCartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  // =====================================================
  // DELIVERY
  // =====================================================

  const delivery = 0;

  // =====================================================
  // TOTAL
  // =====================================================

  const total = subtotal + delivery;

  const getDeliveryAddress = () => [
    address.houseNumber.trim(),
    address.address.trim(),
  ].filter(Boolean).join(", ");

  const deliveryAddressPayload = () => ({
    customerName: address.fullName.trim(),
    phone: address.phone.trim(),
    deliveryAddress: getDeliveryAddress(),
    city: address.city.trim(),
    pincode: address.pincode.trim(),
    deliveryLatitude: deliveryLocation?.latitude ?? null,
    deliveryLongitude: deliveryLocation?.longitude ?? null,
  });

  const openStreetMapUrl = deliveryLocation
    ? `https://www.openstreetmap.org/?mlat=${deliveryLocation.latitude}&mlon=${deliveryLocation.longitude}#map=17/${deliveryLocation.latitude}/${deliveryLocation.longitude}`
    : "";
  const googleMapsUrl = deliveryLocation
    ? `https://www.google.com/maps/search/?api=1&query=${deliveryLocation.latitude}%2C${deliveryLocation.longitude}`
    : "";

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Remove error while user is typing
    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const handleMapLocationChange = (location) => {
    setPendingDeliveryLocation(location);
    setDeliveryLocation(null);
    setLocationError("");
    setLocationMessage("Pin placed. Drag it to adjust, then confirm your delivery location.");
  };

  const useCurrentLocation = () => {
    setLocationError("");
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationError("Location access is not available in this browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        setPendingDeliveryLocation(location);
        setDeliveryLocation(null);
        setLocationMessage("Current location found. Move the pin if needed, then confirm it.");
        setIsLocating(false);
      },
      (error) => {
        const messages = {
          1: "Location permission was denied. Allow location access in your browser and try again.",
          2: "Your current location could not be determined. Try again or enter the address manually.",
          3: "Location request timed out. Try again.",
        };
        setLocationError(messages[error.code] || "Could not access your current location.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const confirmDeliveryLocation = async () => {
    if (!pendingDeliveryLocation || isLocating) {
      return;
    }

    setIsLocating(true);
    setLocationError("");
    setDeliveryLocation(pendingDeliveryLocation);

    try {
      const query = new URLSearchParams({
        format: "jsonv2",
        lat: String(pendingDeliveryLocation.latitude),
        lon: String(pendingDeliveryLocation.longitude),
        zoom: "18",
        addressdetails: "1",
      });
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${query.toString()}`,
        { headers: { "Accept-Language": "en" } }
      );
      if (!response.ok) {
        throw new Error(`Address lookup failed with status ${response.status}`);
      }

      const place = await response.json();
      const parts = place.address || {};
      const houseNumber = parts.house_number || "";
      const street = parts.road || parts.pedestrian || parts.residential || "";
      const locality = parts.neighbourhood || parts.suburb || parts.quarter;
      const detectedAddress = [street, locality].filter(Boolean).join(", ")
        || `GPS pin: ${pendingDeliveryLocation.latitude.toFixed(6)}, ${pendingDeliveryLocation.longitude.toFixed(6)}`;
      const detectedCity = parts.city || parts.town || parts.village
        || parts.municipality || parts.county || "";
      const detectedPincode = String(parts.postcode || "").replace(/\D/g, "").slice(0, 6);

      setAddress((previous) => ({
        ...previous,
        houseNumber,
        address: detectedAddress,
        city: detectedCity,
        pincode: detectedPincode,
      }));
      setErrors((previous) => {
        const nextErrors = { ...previous };
        delete nextErrors.address;
        if (detectedCity) delete nextErrors.city;
        if (detectedPincode) delete nextErrors.pincode;
        return nextErrors;
      });
      setLocationMessage("Delivery location confirmed. Review the address before placing your order.");
    } catch (error) {
      console.error("Could not look up the confirmed delivery location:", error);
      setLocationError("The pin is saved, but its address could not be found. Please enter the street, city, and pincode manually.");
    } finally {
      setIsLocating(false);
    }
  };

  // =====================================================
  // VALIDATE ADDRESS
  // =====================================================

  const validateAddress = () => {
    const newErrors = {};

    const fullName = address.fullName.trim();
    const phone = address.phone.trim();
    const addressText = address.address.trim();
    const city = address.city.trim();
    const pincode = address.pincode.trim();

    // Full Name
    if (!fullName) {
      newErrors.fullName = "Full name is required.";
    } else if (fullName.length < 3) {
      newErrors.fullName = "Please enter a valid full name.";
    }

    // Phone
    if (!phone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone =
        "Enter a valid 10-digit Indian mobile number.";
    }

    // Address
    if (!addressText) {
      newErrors.address = "Delivery address is required.";
    } else if (addressText.length < 10) {
      newErrors.address =
        "Please enter a complete delivery address.";
    }

    // City
    if (!city) {
      newErrors.city = "City is required.";
    }

    // Pincode
    if (!pincode) {
      newErrors.pincode = "Pincode is required.";
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = "Pincode must be exactly 6 digits.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // RAZORPAY PAYMENT HANDLER
  // =====================================================

  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentError("");

      const paymentConfigResponse = await API.get("/payments/razorpay/config");
      const paymentConfig = paymentConfigResponse.data;
      if (!paymentConfig?.enabled || !paymentConfig.keyId) {
        setPaymentError("Online payments are not configured. Please choose cash on delivery or contact support.");
        return;
      }

      // Step 1: Create order first on backend
      console.log("Creating order...");
      const orderResponse = await API.post("/orders/place", deliveryAddressPayload(), {
        params: { userId },
      });

      const orderId = orderResponse.data.id;
      console.log("Order created:", orderId);

      // Step 2: Create Razorpay order
      const razorpayOrderResponse = await API.post("/payments/razorpay/create-order", {
        userId: userId,
        orderId: orderId,
        amount: total,
        description: `ShopVia Order #${orderId}`,
      });

      const razorpayOrderData = razorpayOrderResponse.data;
      console.log("Razorpay order created:", razorpayOrderData);

      // Step 3: Open Razorpay checkout
      const options = {
        key: paymentConfig.keyId,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
        order_id: razorpayOrderData.orderId,
        name: "ShopVia",
        description: `Order #${orderId}`,
        prefill: {
          name: address.fullName,
          email: "customer@shopvia.com",
          contact: address.phone,
        },
        handler: async (response) => {
          try {
            // Step 4: Verify payment on backend
            console.log("Payment handler called with:", response);
            const verifyResponse = await API.post("/payments/razorpay/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              userId: userId,
              orderId: orderId,
            });

            console.log("Payment verified:", verifyResponse.data);

            // Step 5: Show success
            const orderData = {
              id: orderId,
              totalAmount: total,
              paymentStatus: "SUCCESS",
              status: "CONFIRMED",
              customerName: address.fullName,
              phone: address.phone,
              deliveryAddress: getDeliveryAddress(),
              city: address.city,
              pincode: address.pincode,
              deliveryLatitude: deliveryLocation?.latitude ?? null,
              deliveryLongitude: deliveryLocation?.longitude ?? null,
              paymentMethod: "RAZORPAY",
              razorpayPaymentId: response.razorpay_payment_id,
            };

            if (onOrderSuccess) {
              onOrderSuccess(orderData);
            }
          } catch (verifyError) {
            console.error("Payment verification failed:", verifyError);
            setPaymentError("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: async () => {
            console.log("Razorpay checkout closed");
            setIsProcessing(false);
            setPaymentError("Payment cancelled by user");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay payment error:", error);
      setPaymentError(
        error.response?.data?.message || error.message || "Payment processing failed"
      );
      setIsProcessing(false);
    }
  };

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handlePlaceOrder = async () => {
    // First validate address
    const isValid = validateAddress();

    if (!isValid) {
      alert("Please fill all delivery details correctly.");
      return;
    }

    setPaymentError("");

    if (paymentMethod === "RAZORPAY") {
      // Razorpay payment flow
      await handleRazorpayPayment();
    } else {
      // COD payment flow
      try {
        setIsProcessing(true);

        const orderResponse = await API.post("/orders/place", deliveryAddressPayload(), {
          params: { userId },
        });

        const orderId = orderResponse.data.id;

        // Create payment record for COD
        await API.post("/payments/pay", null, {
          params: {
            userId: userId,
            orderId: orderId,
            paymentMethod: "COD",
          },
        });

        const orderData = {
          id: orderId,
          totalAmount: total,
          paymentStatus: "PENDING",
          status: "CONFIRMED",
          customerName: address.fullName,
          phone: address.phone,
          deliveryAddress: getDeliveryAddress(),
          city: address.city,
          pincode: address.pincode,
          deliveryLatitude: deliveryLocation?.latitude ?? null,
          deliveryLongitude: deliveryLocation?.longitude ?? null,
          paymentMethod: "COD",
        };

        if (onOrderSuccess) {
          onOrderSuccess(orderData);
        }
      } catch (error) {
        console.error("Order creation error:", error);
        setPaymentError(
          error.response?.data?.message || "Failed to create order"
        );
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (safeCartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">🛒</div>

          <h2>Your cart is empty</h2>

          <p>
            Please add some products before proceeding
            to checkout.
          </p>

          <button
            type="button"
            className="checkout-back-btn"
            onClick={onBackToCart}
          >
            ← Back to Shopping
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // CHECKOUT UI
  // =====================================================

  return (
    <div className="checkout-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="checkout-header">
        <div>
          <span className="checkout-label">
            SHOPVIA CHECKOUT
          </span>

          <h1>Complete Your Order</h1>

          <p>
            Review your order and confirm your purchase.
          </p>
        </div>

        <button
          type="button"
          className="checkout-back-top"
          onClick={onBackToCart}
        >
          ← Back to Cart
        </button>
      </div>

      {/* =================================================
          MAIN CHECKOUT
      ================================================= */}

      <div className="checkout-container">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="checkout-left">

          {/* DELIVERY ADDRESS */}

          <div className="checkout-card">

            <div className="checkout-card-header">

              <div className="checkout-number">
                1
              </div>

              <div>
                <h2>Delivery Address</h2>

                <p>
                  Where should we deliver your order?
                </p>
              </div>

            </div>

            <section className="delivery-location-section" aria-label="Choose delivery location">
              <DeliveryLocationMap
                location={pendingDeliveryLocation}
                onLocationChange={handleMapLocationChange}
              />
              <small className="map-attribution">Map data © OpenStreetMap contributors</small>

              {deliveryLocation && (
                <div className="delivery-location-heading">
                  <small>
                    Confirmed pin: {deliveryLocation.latitude.toFixed(6)}, {deliveryLocation.longitude.toFixed(6)}
                  </small>
                  <div className="delivery-map-links">
                    <a href={openStreetMapUrl} target="_blank" rel="noreferrer">OpenStreetMap</a>
                    <a href={googleMapsUrl} target="_blank" rel="noreferrer">Google Maps</a>
                  </div>
                </div>
              )}

              <div className="delivery-location-actions">
                <button
                  type="button"
                  className="use-location-button"
                  onClick={useCurrentLocation}
                  disabled={isLocating}
                >
                  <span aria-hidden="true">📍</span>
                  {isLocating && !pendingDeliveryLocation
                    ? "Finding location…"
                    : "Choose my current location"}
                </button>
                <button
                  type="button"
                  className="confirm-location-button"
                  onClick={confirmDeliveryLocation}
                  disabled={!pendingDeliveryLocation || isLocating}
                >
                  {isLocating ? "Confirming…" : "Confirm selected location"}
                </button>
                <small className="location-privacy-note">
                  Map tiles come from OpenStreetMap. Device location is requested only when tapped; coordinates are sent to OpenStreetMap to look up the address after confirmation.
                </small>
              </div>
              {pendingDeliveryLocation && !deliveryLocation && (
                <small className="pending-location-coordinates">
                  Pin: {pendingDeliveryLocation.latitude.toFixed(6)}, {pendingDeliveryLocation.longitude.toFixed(6)}
                </small>
              )}

              {locationMessage && (
                <small className="location-status" role="status">{locationMessage}</small>
              )}
              {locationError && (
                <small className="location-error" role="alert">{locationError}</small>
              )}

              {deliveryLocation && (
                <div className="delivery-location-heading">
                  <small>
                    Pin: {deliveryLocation.latitude.toFixed(6)}, {deliveryLocation.longitude.toFixed(6)}
                  </small>
                  <div className="delivery-map-links">
                    <a href={openStreetMapUrl} target="_blank" rel="noreferrer">OpenStreetMap</a>
                    <a href={googleMapsUrl} target="_blank" rel="noreferrer">Google Maps</a>
                  </div>
                </div>
              )}
            </section>

            <div className="address-grid">

              {/* FULL NAME */}

              <div className="input-group">
                <label>
                  Full Name
                  <span className="required">*</span>
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={address.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={
                    errors.fullName ? "input-error" : ""
                  }
                />

                {errors.fullName && (
                  <small className="field-error">
                    {errors.fullName}
                  </small>
                )}
              </div>

              {/* PHONE */}

              <div className="input-group">
                <label>
                  Phone Number
                  <span className="required">*</span>
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                  className={
                    errors.phone ? "input-error" : ""
                  }
                />

                {errors.phone && (
                  <small className="field-error">
                    {errors.phone}
                  </small>
                )}
              </div>

              <div className="input-group">
                <label>House / Flat number <span>(optional)</span></label>
                <input
                  type="text"
                  name="houseNumber"
                  value={address.houseNumber}
                  onChange={handleInputChange}
                  placeholder="Enter house or flat number"
                />
              </div>

              {/* ADDRESS */}

              <div className="input-group full-width">
                <label>
                  Street / Area
                  <span className="required">*</span>
                </label>

                <input
                  type="text"
                  name="address"
                  value={address.address}
                  onChange={handleInputChange}
                  placeholder="Enter street, area, or landmark"
                  className={
                    errors.address ? "input-error" : ""
                  }
                />

                {errors.address && (
                  <small className="field-error">
                    {errors.address}
                  </small>
                )}
              </div>

              {/* CITY */}

              <div className="input-group">
                <label>
                  City
                  <span className="required">*</span>
                </label>

                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  className={
                    errors.city ? "input-error" : ""
                  }
                />

                {errors.city && (
                  <small className="field-error">
                    {errors.city}
                  </small>
                )}
              </div>

              {/* PINCODE */}

              <div className="input-group">
                <label>
                  Pincode
                  <span className="required">*</span>
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={address.pincode}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit pincode"
                  maxLength="6"
                  className={
                    errors.pincode ? "input-error" : ""
                  }
                />

                {errors.pincode && (
                  <small className="field-error">
                    {errors.pincode}
                  </small>
                )}
              </div>

            </div>
          </div>

          {/* PAYMENT */}

          <div className="checkout-card">

            <div className="checkout-card-header">

              <div className="checkout-number">
                2
              </div>

              <div>
                <h2>Payment Method</h2>

                <p>
                  Choose your preferred payment method.
                </p>
              </div>

            </div>

            <div className="payment-options">

              <label className={`payment-option ${paymentMethod === "RAZORPAY" ? "active" : ""}`}>

                <input
                  type="radio"
                  name="payment"
                  value="RAZORPAY"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <div className="payment-icon">
                  💳
                </div>

                <div>
                  <strong>
                    Online Payment
                  </strong>

                  <small>
                    UPI, Debit Card, Credit Card
                  </small>
                </div>

              </label>

              <label className={`payment-option ${paymentMethod === "COD" ? "active" : ""}`}>

                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />

                <div className="payment-icon">
                  💵
                </div>

                <div>
                  <strong>
                    Cash on Delivery
                  </strong>

                  <small>
                    Pay when your order arrives
                  </small>
                </div>

              </label>

            </div>
          </div>

          {/* SECURITY */}

          <div className="checkout-security">

            <span>🔒</span>

            <div>
              <strong>
                Secure Checkout
              </strong>

              <p>
                Your personal and payment information
                is protected.
              </p>
            </div>

          </div>

        </div>

        {/* =================================================
            RIGHT SIDE - ORDER SUMMARY
        ================================================= */}

        <div className="checkout-right">

          <div className="checkout-summary">

            <div className="summary-title">

              <span>
                ORDER SUMMARY
              </span>

              <h2>
                Your Order
              </h2>

              <p>
                {totalItems} item
                {totalItems !== 1 ? "s" : ""}
              </p>

            </div>

            {/* ITEMS */}

            <div className="checkout-items">

              {safeCartItems.map((item) => {

                const product =
                  getProductById(item.productId);

                const itemTotal =
                  Number(item.price || 0) *
                  Number(item.quantity || 0);

                return (
                  <div
                    className="checkout-item"
                    key={item.id}
                  >

                    <div className="checkout-item-image">

                      {product?.image ? (
                        <img
                          src={getProductImageUrl(product.image)}
                          alt={
                            product.name || "Product"
                          }
                        />
                      ) : (
                        <span>
                          🛍️
                        </span>
                      )}

                    </div>

                    <div className="checkout-item-info">

                      <h3>
                        {product?.name ||
                          `Product #${item.productId}`}
                      </h3>

                      <p>
                        Qty: {item.quantity}
                      </p>

                    </div>

                    <strong>
                      ₹{formatPrice(itemTotal)}
                    </strong>

                  </div>
                );
              })}

            </div>

            {/* PRICE */}

            <div className="checkout-price-section">

              <div className="checkout-price-row">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="checkout-price-row">
                <span>Subtotal</span>

                <strong>
                  ₹{formatPrice(subtotal)}
                </strong>
              </div>

              <div className="checkout-price-row">
                <span>Delivery</span>

                <strong className="free">
                  FREE
                </strong>
              </div>

              <div className="checkout-divider"></div>

              <div className="checkout-total">
                <span>Total</span>

                <strong>
                  ₹{formatPrice(total)}
                </strong>
              </div>

            </div>

            {/* PAYMENT ERROR */}

            {paymentError && (
              <div className="checkout-error">
                <span>⚠️</span>
                <div>
                  <strong>Payment Error</strong>
                  <p>{paymentError}</p>
                </div>
              </div>
            )}

            {/* PLACE ORDER */}

            <button
              type="button"
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={isProcessing || isLocating}
            >
              {isLocating ? (
                <>Confirming delivery location…</>
              ) : isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>Place Order · ₹{formatPrice(total)}</>
              )}
            </button>

            <p className="checkout-note">
              By placing your order, you agree to
              SHOPVIA's Terms & Conditions.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default CheckoutPage;
