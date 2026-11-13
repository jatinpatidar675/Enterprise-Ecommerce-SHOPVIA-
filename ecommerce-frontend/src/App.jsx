
import "./App.css";

import { useEffect, useState } from "react";

import API, { getProductImageUrl } from "./api";

import AdminPanel from "./components/AdminPanel";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ThemeToggle from "./components/ThemeToggle";

import CheckoutPage from "./components/CheckoutPage";
import OrderSuccessPage from "./components/OrderSuccessPage";
import OrdersPage from "./components/OrdersPage";
import ProfilePage from "./components/ProfilePage";
import WishlistPage from "./components/WishlistPage";
import ProductImageGallery from "./components/ProductImageGallery";

function App() {
  // =====================================================
  // AUTHENTICATION INITIAL STATE
  // =====================================================

  const getInitialAuth = () => {
    const savedUser = localStorage.getItem("user");
    const savedUserId = localStorage.getItem("userId");
    const savedToken = localStorage.getItem("token");

    if (!savedUser || !savedUserId || !savedToken) {
      return {
        isLoggedIn: false,
        userId: null,
        user: {},
      };
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      return {
        isLoggedIn: true,
        userId: Number(savedUserId),
        user: parsedUser,
      };
    } catch (error) {
      console.error("Saved user parsing error:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("token");

      return {
        isLoggedIn: false,
        userId: null,
        user: {},
      };
    }
  };

  // Initial authentication is calculated only once
  const [initialAuth] = useState(getInitialAuth);

  const [isLoggedIn, setIsLoggedIn] = useState(
    initialAuth.isLoggedIn
  );

  const [authPage, setAuthPage] = useState("login");

  const [userId, setUserId] = useState(
    initialAuth.userId
  );

  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(
    initialAuth.user
  );

  // =====================================================
  // MAIN STATES
  // =====================================================

  const [products, setProducts] = useState([]);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  const [categories, setCategories] = useState([]);

  const [deals, setDeals] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const [searchTerm, setSearchTerm] = useState("");

  const [showDealsOnly, setShowDealsOnly] = useState(false);

  const [cartItems, setCartItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [cartLoading, setCartLoading] = useState(false);

  const [error, setError] = useState("");

  const [showCart, setShowCart] = useState(false);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewQuantity, setQuickViewQuantity] = useState(1);
  const [quickViewAdding, setQuickViewAdding] = useState(false);

  const [page, setPage] = useState("home");

  const [orderData, setOrderData] = useState(null);

  // =====================================================
  // THEME STATE
  // =====================================================

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isAdmin = String(user?.role || "")
    .replace(/^ROLE_/i, "")
    .toUpperCase() === "ADMIN";

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-IN");
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    return getProductImageUrl(image);
  };

  // =====================================================
  // LOGIN SUCCESS
  // =====================================================

  const handleLoginSuccess = (loginData) => {
    console.log("Login response:", loginData);

    /*
      Expected backend response:

      {
        token: "...",
        userId: 4,
        name: "...",
        email: "...",
        role: "USER"
      }
    */

    if (!loginData) {
      alert("Invalid login response.");
      return;
    }

    const loggedInUser = {
      id: loginData.userId,
      name: loginData.name,
      email: loginData.email,
      role: loginData.role,
    };

    // ---------------------------------------------------
    // SAVE AUTH DATA
    // ---------------------------------------------------

    localStorage.setItem(
      "token",
      loginData.token
    );

    localStorage.setItem(
      "userId",
      String(loginData.userId)
    );

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    // ---------------------------------------------------
    // UPDATE REACT STATE
    // ---------------------------------------------------

    setUserId(Number(loginData.userId));

    setUser(loggedInUser);

    setIsLoggedIn(true);

    const isAdminLogin = String(loginData.role || "")
      .replace(/^ROLE_/i, "")
      .toUpperCase() === "ADMIN";
    setPage(isAdminLogin ? "admin" : "home");

    setAuthPage("login");

    console.log(
      "User logged in successfully:",
      loggedInUser
    );
  };

  // =====================================================
  // REGISTER SUCCESS
  // =====================================================

  const handleRegisterSuccess = () => {
    console.log(
      "Registration successful."
    );

    alert(
      "Registration successful! Please login."
    );

    // IMPORTANT:
    // Go back to login page
    setAuthPage("login");
  };

  // =====================================================
  // FETCH USER
  // =====================================================

  const fetchUser = async () => {
    if (!userId) {
      return;
    }

    try {
      console.log(
        "Fetching user:",
        userId
      );

      const response = await API.get(
        `/users/${userId}`
      );

      console.log(
        "User from backend:",
        response.data
      );

      const userData =
        response.data || {};

      setUser(userData);

      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );
    } catch (err) {
      console.error(
        "User API Error:",
        err
      );
    }
  };

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/products"
      );

      console.log(
        "Products from backend:",
        response.data
      );

      if (
        Array.isArray(
          response.data
        )
      ) {
        setProducts(
          response.data
        );
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(
        "Product API Error:",
        err
      );

      setProducts([]);

      setError(
        "Unable to load products. Please make sure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!userId) {
      setWishlistItems([]);
      return;
    }

    try {
      setWishlistLoading(true);
      setWishlistError("");
      const response = await API.get(`/wishlist/${userId}`);
      setWishlistItems(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error("Wishlist API Error:", requestError);
      setWishlistError(requestError.response?.data?.message || "Could not load your wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get("/categories");
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error("Categories API Error:", requestError);
      setCategories([]);
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await API.get("/deals");
      setDeals(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error("Deals API Error:", requestError);
      setDeals([]);
    }
  };

  // =====================================================
  // FETCH CART
  // =====================================================

  const fetchCart = async () => {
    if (!userId) {
      setCartItems([]);
      return;
    }

    try {
      setCartLoading(true);

      const response = await API.get(
        `/cart/${userId}`
      );

      console.log(
        "Cart from backend:",
        response.data
      );

      if (
        Array.isArray(
          response.data
        )
      ) {
        setCartItems(
          response.data
        );
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error(
        "Cart API Error:",
        err
      );

      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA AFTER LOGIN
  // =====================================================

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        await fetchUser();
        await fetchProducts();
        await fetchCart();
        await fetchWishlist();
        await fetchCategories();
        await fetchDeals();
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Initial data loading error:",
            err
          );
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };

    // These functions intentionally run when
    // authentication/userId changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, userId]);

  // =====================================================
  // OPEN CART
  // =====================================================

  const openCart = async () => {
    console.log(
      "Cart button clicked"
    );

    setShowCart(true);

    await fetchCart();
  };

  // =====================================================
  // CLOSE CART
  // =====================================================

  const closeCart = () => {
    setShowCart(false);
  };

  const openProductQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewQuantity(1);
  };

  const closeProductQuickView = () => {
    setQuickViewProduct(null);
    setQuickViewAdding(false);
  };

  useEffect(() => {
    if (!quickViewProduct) {
      return undefined;
    }

    const handleQuickViewKeyDown = (event) => {
      if (event.key === "Escape") {
        setQuickViewProduct(null);
        setQuickViewAdding(false);
      }
    };

    window.addEventListener("keydown", handleQuickViewKeyDown);
    return () => window.removeEventListener("keydown", handleQuickViewKeyDown);
  }, [quickViewProduct]);

  // =====================================================
  // ADD TO CART
  // =====================================================

  const addToCart = async (product, quantity = 1) => {
    if (!userId) {
      alert(
        "Please login first."
      );

      return false;
    }

    try {
      const cartData = {
        userId: userId,
        productId: product.id,
        quantity: Number(quantity),
      };

      console.log(
        "Sending cart data:",
        cartData
      );

      const response = await API.post(
        "/cart/add",
        cartData
      );

      console.log(
        "Added to cart:",
        response.data
      );

      await fetchCart();

      alert(
        `${product.name} added to cart successfully!`
      );
      return true;
    } catch (err) {
      console.error(
        "Add to Cart Error:",
        err
      );

      if (err.response) {
        console.error(
          "Backend response:",
          err.response.data
        );

        console.error(
          "Status:",
          err.response.status
        );

        const message =
          err.response.data?.message ||
          err.response.data?.error ||
          "Unable to add product to cart.";

        alert(message);
      } else {
        alert(
          "Unable to connect to backend."
        );
      }
      return false;
    }
  };

  const addQuickViewProductToCart = async () => {
    if (!quickViewProduct || quickViewAdding) {
      return;
    }

    setQuickViewAdding(true);
    const added = await addToCart(quickViewProduct, quickViewQuantity);
    if (added) {
      closeProductQuickView();
    } else {
      setQuickViewAdding(false);
    }
  };

  const toggleWishlist = async (product) => {
    if (!userId) {
      setAuthPage("login");
      setIsLoggedIn(false);
      return;
    }

    const alreadySaved = wishlistItems.some((item) => item.productId === product.id);
    try {
      if (alreadySaved) {
        await API.delete(`/wishlist/${userId}/${product.id}`);
      } else {
        await API.post(`/wishlist/${userId}/${product.id}`);
      }
      await fetchWishlist();
    } catch (requestError) {
      console.error("Wishlist update failed:", requestError);
      alert(requestError.response?.data?.message || "Could not update your wishlist.");
    }
  };

  const moveWishlistProductToCart = async (productId) => {
    try {
      await API.post(`/wishlist/${userId}/${productId}/cart`);
      await Promise.all([fetchWishlist(), fetchCart()]);
      alert("Product moved to your cart.");
    } catch (requestError) {
      console.error("Move wishlist product to cart failed:", requestError);
      alert(requestError.response?.data?.message || "Could not move this product to your cart.");
    }
  };

  // =====================================================
  // REMOVE FROM CART
  // =====================================================

  const removeFromCart = async (
    cartId
  ) => {
    try {
      console.log(
        "Removing cart item:",
        cartId
      );

      await API.delete(
        `/cart/${cartId}`
      );

      await fetchCart();

      alert(
        "Product removed from cart."
      );
    } catch (err) {
      console.error(
        "Remove Cart Error:",
        err
      );

      if (err.response) {
        console.error(
          "Backend response:",
          err.response.data
        );

        console.error(
          "Status:",
          err.response.status
        );
      }

      alert(
        "Unable to remove product from cart."
      );
    }
  };

  // =====================================================
  // UPDATE QUANTITY
  // =====================================================

  const updateQuantity = async (
    cartItem,
    newQuantity
  ) => {
    const quantity =
      Number(newQuantity);

    if (quantity <= 0) {
      await removeFromCart(
        cartItem.id
      );

      return;
    }

    try {
      console.log(
        "Updating quantity:",
        cartItem.id,
        "=>",
        quantity
      );

      await API.put(
        `/cart/${cartItem.id}?quantity=${quantity}`
      );

      await fetchCart();
    } catch (err) {
      console.error(
        "Update Quantity Error:",
        err
      );

      if (err.response) {
        const message =
          err.response.data?.message ||
          err.response.data?.error ||
          "Unable to update quantity.";

        alert(message);
      } else {
        alert(
          "Unable to connect to backend."
        );
      }
    }
  };

  // =====================================================
  // GET PRODUCT BY ID
  // =====================================================

  const getProductById = (
    productId
  ) => {
    return products.find(
      (product) =>
        Number(product.id) ===
        Number(productId)
    );
  };

  // =====================================================
  // CART COUNT
  // =====================================================

  const cartCount =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );

  // =====================================================
  // CART SUBTOTAL
  // =====================================================

  const subtotal =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(
          item.price || 0
        ) *
          Number(
            item.quantity || 0
          ),
      0
    );

  const categoriesForNavigation = categories.length > 0
    ? categories
    : [...new Set(products.map((product) => product.category).filter(Boolean))]
        .sort((left, right) => left.localeCompare(right))
        .map((name) => ({ id: name, name, parentId: null }));

  const dealsByProductId = new Map(deals.map((deal) => [deal.productId, deal]));
  const quickViewDeal = quickViewProduct
    ? dealsByProductId.get(quickViewProduct.id)
    : null;
  const quickViewImages = quickViewProduct
    ? [...new Set([
        quickViewProduct.image,
        ...(Array.isArray(quickViewProduct.images) ? quickViewProduct.images : []),
      ]
        .filter((image) => typeof image === "string" && image.trim())
        .map((image) => getImageUrl(image.trim())))]
    : [];
  const quickViewStock = quickViewProduct
    ? Number(quickViewProduct.quantity)
    : Number.NaN;
  const wishlistProductIds = new Set(wishlistItems.map((item) => item.productId));
  const filteredProducts = products.filter((product) => {
    const query = searchTerm.trim().toLocaleLowerCase();
    const matchesCategory = selectedCategory === "All Categories"
      || String(product.category || "").toLocaleLowerCase() === selectedCategory.toLocaleLowerCase();
    const matchesSearch = !query
      || `${product.name || ""} ${product.description || ""} ${product.category || ""}`
        .toLocaleLowerCase()
        .includes(query);
    const matchesDeals = !showDealsOnly || dealsByProductId.has(product.id);
    return matchesCategory && matchesSearch && matchesDeals;
  });

  const scrollToProducts = () => {
    document.querySelector(".main-content")?.scrollIntoView({ behavior: "smooth" });
  };

  const selectCategory = (categoryName) => {
    setSelectedCategory(categoryName);
    setShowDealsOnly(false);
    scrollToProducts();
  };

  const showWishlist = () => {
    setPage("wishlist");
    fetchWishlist();
  };

  const showDeals = () => {
    setSelectedCategory("All Categories");
    setShowDealsOnly(true);
    scrollToProducts();
  };

  // =====================================================
  // CLEAR CART AFTER ORDER
  // =====================================================

  const clearCartAfterOrder =
    async () => {
      try {
        if (
          !Array.isArray(
            cartItems
          ) ||
          cartItems.length === 0
        ) {
          setCartItems([]);
          return;
        }

        console.log(
          "Clearing cart after successful order..."
        );

        for (
          const item of cartItems
        ) {
          try {
            console.log(
              "Deleting cart item:",
              item.id
            );

            await API.delete(
              `/cart/${item.id}`
            );
          } catch (
            deleteError
          ) {
            console.error(
              "Failed to delete cart item:",
              item.id,
              deleteError
            );
          }
        }

        setCartItems([]);

        await fetchCart();

        console.log(
          "Cart successfully cleared."
        );
      } catch (err) {
        console.error(
          "Clear Cart After Order Error:",
          err
        );

        setCartItems([]);
      }
    };

  // =====================================================
  // ORDER SUCCESS
  // =====================================================

  const handleOrderSuccess =
    async (order) => {
      console.log(
        "Order successfully placed:",
        order
      );

      setOrderData(order);

      await clearCartAfterOrder();

      setShowCart(false);

      setPage("success");
    };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    console.log(
      "Logging out user..."
    );

    // ---------------------------------------------------
    // CLEAR LOCAL STORAGE
    // ---------------------------------------------------

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "userId"
    );

    localStorage.removeItem(
      "token"
    );

    // ---------------------------------------------------
    // CLEAR SESSION STORAGE
    // ---------------------------------------------------

    sessionStorage.removeItem(
      "user"
    );

    sessionStorage.removeItem(
      "userId"
    );

    sessionStorage.removeItem(
      "token"
    );

    // ---------------------------------------------------
    // CLEAR REACT STATE
    // ---------------------------------------------------

    setUser({});

    setUserId(null);

    setCartItems([]);
    setWishlistItems([]);
    setWishlistError("");

    setOrderData(null);

    setShowCart(false);

    setIsLoggedIn(false);

    setPage("home");

    setAuthPage("login");

    alert(
      "You have been logged out successfully."
    );
  };

  // =====================================================
  // LOGIN / REGISTER PAGE
  // =====================================================

  if (!isLoggedIn) {
    // ---------------------------------------------------
    // REGISTER PAGE
    // ---------------------------------------------------

    if (
      authPage === "register"
    ) {
      return (
        <>
          <ThemeToggle theme={theme} onToggle={toggleTheme} className="theme-toggle-float" />
          <RegisterPage
            onRegisterSuccess={handleRegisterSuccess}
            onLogin={() => setAuthPage("login")}
          />
        </>
      );
    }

    // ---------------------------------------------------
    // LOGIN PAGE
    // ---------------------------------------------------

    return (
      <>
        <ThemeToggle theme={theme} onToggle={toggleTheme} className="theme-toggle-float" />
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onRegister={() => setAuthPage("register")}
        />
      </>
    );
  }

  if (isAdmin) {
    return (
      <AdminPanel
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (page === "wishlist") {
    return (
      <>
        <ThemeToggle theme={theme} onToggle={toggleTheme} className="theme-toggle-float" />
        <WishlistPage
          items={wishlistItems}
          loading={wishlistLoading}
          error={wishlistError}
          formatPrice={formatPrice}
          getImageUrl={getProductImageUrl}
          onBack={() => setPage("home")}
          onRemove={(productId) => toggleWishlist({ id: productId })}
          onMoveToCart={moveWishlistProductToCart}
        />
      </>
    );
  }

  // =====================================================
  // PROFILE PAGE
  // =====================================================

  if (
    page === "profile"
  ) {
    return (
      <>
        <ThemeToggle theme={theme} onToggle={toggleTheme} className="theme-toggle-float" />
        <ProfilePage
          user={user}
          userId={userId}
          onBack={() => setPage("home")}
          onOrders={() => setPage("orders")}
          onContinueShopping={() => setPage("home")}
          onLogout={handleLogout}
        />
      </>
    );
  }

  // =====================================================
  // ORDERS PAGE
  // =====================================================

  if (
    page === "orders"
  ) {
    return (
      <>
        <ThemeToggle theme={theme} onToggle={toggleTheme} className="theme-toggle-float" />
        <OrdersPage userId={userId} formatPrice={formatPrice} onBack={() => setPage("home")} />
      </>
    );
  }

  // =====================================================
  // CHECKOUT PAGE
  // =====================================================

  if (
    page === "checkout"
  ) {
    return (
      <>
        <ThemeToggle theme={theme} onToggle={toggleTheme} className="theme-toggle-float" />
        <CheckoutPage
          cartItems={cartItems}
          products={products}
          subtotal={subtotal}
          userId={userId}
          formatPrice={formatPrice}
          getImageUrl={getImageUrl}
          onBackToCart={async () => {
            setPage("home");
            setShowCart(true);
            await fetchCart();
          }}
          onOrderSuccess={handleOrderSuccess}
        />
      </>
    );
  }

  // =====================================================
  // ORDER SUCCESS PAGE
  // =====================================================

  if (
    page === "success"
  ) {
    return (
      <>
        <ThemeToggle theme={theme} onToggle={toggleTheme} className="theme-toggle-float" />
        <OrderSuccessPage
          order={orderData}
          formatPrice={formatPrice}
          onContinueShopping={() => {
            setPage("home");
            fetchProducts();
            fetchCart();
          }}
        />
      </>
    );
  }

  // =====================================================
  // HOME PAGE
  // =====================================================

  return (
    <div className="store">

      {/* =================================================
          OFFER BAR
      ================================================= */}

      <div className="offer-bar">

        <span>
          ⚡ MEGA SALE
        </span>

        <span>
          Free delivery on orders above ₹999
        </span>

        <span>
          24/7 Customer Support
        </span>

      </div>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="navbar">

        {/* BRAND */}

        <div
          className="brand"

          onClick={() =>
            setPage("home")
          }

          style={{
            cursor: "pointer",
          }}
        >

          <div className="shopvia-logo">

            <span className="logo-shape">
              S
            </span>

          </div>

          <div className="brand-text">

            <h2>
              SHOPVIA
            </h2>

            <small>
              SMART COMMERCE
            </small>

          </div>

        </div>

        {/* SEARCH */}

        <div className="search-box">

          <span>
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search for products, brands and more..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") scrollToProducts();
            }}
          />

          <button type="button" onClick={scrollToProducts}>
            Search
          </button>

        </div>

        {/* NAV ACTIONS */}

        <div className="nav-actions">

          {/* WISHLIST */}

          <button
            type="button"
            className="nav-action"
            onClick={showWishlist}
            aria-pressed={page === "wishlist"}
            title="Show your saved products"
          >

            <span className="nav-icon">
              {wishlistItems.length > 0 ? "♥" : "♡"}
            </span>

            <small>
              Wishlist {wishlistItems.length > 0 ? `(${wishlistItems.length})` : ""}
            </small>

          </button>

          {/* PROFILE */}

          <button
            type="button"
            className="nav-action profile-action"

            onClick={async () => {
              await fetchUser();
              setPage("profile");
            }}

            title="Open profile"
          >

            <span className="nav-icon">
              👤
            </span>

            <small>
              Profile
            </small>

          </button>

          {/* ORDERS */}

          <button
            type="button"
            className="nav-action order-action"

            onClick={() => {
              setPage("orders");
            }}
          >

            <span className="order-icon">
              📦
            </span>

            <small>
              Orders
            </small>

          </button>

          {isAdmin && (
            <button
              type="button"
              className="nav-action"
              onClick={() => setPage("admin")}
              title="Open admin workspace"
            >
              <span className="nav-icon" aria-hidden="true">▦</span>
              <small>Admin</small>
            </button>
          )}

          {/* CART */}

          <button
            type="button"
            className="cart-action"

            onClick={openCart}

            title="Open shopping cart"
          >

            <span className="nav-icon">
              🛒
            </span>

            <b>
              {cartCount}
            </b>

            <small>
              Cart
            </small>

          </button>

          {/* THEME TOGGLE */}

          <button
            type="button"
            className="nav-action"

            onClick={toggleTheme}

            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >

            <span className="nav-icon">
              {theme === "dark" ? "🌙" : "☀️"}
            </span>

            <small>
              {theme === "dark" ? "Dark" : "Light"}
            </small>

          </button>

          {/* LOGOUT */}

          <button
            type="button"
            className="nav-action"

            onClick={
              handleLogout
            }

            title="Logout"
          >

            <span className="nav-icon">
              🚪
            </span>

            <small>
              Logout
            </small>

          </button>

        </div>

      </header>

      {/* =================================================
          CATEGORY NAV
      ================================================= */}

      <nav className="category-nav">
        <button
          type="button"
          className={`category-item ${selectedCategory === "All Categories" ? "active" : ""}`}
          onClick={() => selectCategory("All Categories")}
        >
          All Categories
        </button>
        {categoriesForNavigation.map((category) => (
          <button
            type="button"
            key={category.id ?? category.name}
            className={`category-item ${selectedCategory === category.name ? "active" : ""}`}
            onClick={() => selectCategory(category.name)}
            title={category.description || category.name}
          >
            {category.parentId ? "↳ " : ""}{category.name}
          </button>
        ))}
        <button
          type="button"
          className={`category-item sale ${showDealsOnly ? "active" : ""}`}
          onClick={showDeals}
        >
          Deals
        </button>
      </nav>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="hero">

        <div className="hero-left">

          <span className="hero-tag">
            ✦ PREMIUM SHOPPING EXPERIENCE
          </span>

          <h1>
            Everything You Need.
            <br />

            <strong>
              One Powerful Store.
            </strong>
          </h1>

          <p>
            Discover premium electronics,
            smart devices and everyday
            essentials at prices you'll love.
            Experience shopping designed
            for the modern world.
          </p>

          <div className="hero-buttons">

            <button
              type="button"
              className="primary-btn"

              onClick={() => {
                document
                  .querySelector(
                    ".main-content"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              Shop Collection →
            </button>

            <button
              type="button"
              className="secondary-btn"

              onClick={() => {
                document
                  .querySelector(
                    ".deal-banner"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              Explore Deals
            </button>

          </div>

          <div className="hero-stats">

            <div>
              <strong>
                4.9/5
              </strong>

              <span>
                Customer Rating
              </span>
            </div>

          </div>

        </div>

        <div className="hero-right">

          <div className="hero-circle"></div>

          <div className="floating-card card-one">

            <span>
              ✨
            </span>

            <div>
              <strong>
                Fresh Finds
              </strong>

              <small>
                Discover something you love
              </small>
            </div>

          </div>

          <div className="product-showcase">

            <div className="showcase-glow"></div>

            <span>
              🛍️
            </span>

          </div>

          <div className="floating-card card-two">

            <span>
              ⭐
            </span>

            <div>
              <strong>
                4.9
              </strong>

              <small>
                Top Rated
              </small>
            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          TRUST SECTION
      ================================================= */}

      <section className="trust-section">

        <div>

          <span>
            🚚
          </span>

          <div>

            <strong>
              Fast Delivery
            </strong>

            <small>
              Across India
            </small>

          </div>

        </div>

        <div>

          <span>
            🔒
          </span>

          <div>

            <strong>
              Secure Payment
            </strong>

            <small>
              100% Protected
            </small>

          </div>

        </div>

        <div>

          <span>
            ↩️
          </span>

          <div>

            <strong>
              Easy Returns
            </strong>

            <small>
              7 Days Return
            </small>

          </div>

        </div>

        <div>

          <span>
            ✓
          </span>

          <div>

            <strong>
              Verified Products
            </strong>

            <small>
              Quality Guaranteed
            </small>

          </div>

        </div>

      </section>

      {/* =================================================
          PRODUCTS
      ================================================= */}

      <main className="main-content">

        <div className="section-header">

          <div>

            <span className="section-label">
              HANDPICKED FOR YOU
            </span>

            <h2>
              Trending Products
            </h2>

            <p>
              Our most popular products this week
            </p>

          </div>

          <button
            type="button"
            className="view-all"
            onClick={
              fetchProducts
            }
          >
            Refresh Products →
          </button>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="products-message">

            <div className="loader"></div>

            <p>
              Loading products...
            </p>

          </div>

        )}

        {/* ERROR */}

        {!loading &&
          error && (

            <div className="products-message error-message">

              <h3>
                ⚠️ Unable to load products
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={
                  fetchProducts
                }
                className="primary-btn"
              >
                Try Again
              </button>

            </div>

          )}

        {/* PRODUCT GRID */}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (

            <div className="product-grid">

              {filteredProducts.map(
                (product) => (

                  <div
                    className="product-card"
                    key={product.id}
                  >

                    <div className="product-top">

                      <span className="discount">
                        {dealsByProductId.has(product.id)
                          ? `${Number(dealsByProductId.get(product.id).discountPercent).toFixed(0)}% OFF`
                          : `${product.quantity} in stock`}
                      </span>

                      <button
                        type="button"
                        className={`heart ${wishlistProductIds.has(product.id) ? "saved" : ""}`}
                        onClick={() => toggleWishlist(product)}
                        aria-label={wishlistProductIds.has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                        aria-pressed={wishlistProductIds.has(product.id)}
                      >
                        {wishlistProductIds.has(product.id) ? "♥" : "♡"}
                      </button>

                    </div>

                    <button
                      type="button"
                      className="product-image product-quick-view-trigger"
                      onClick={() => openProductQuickView(product)}
                      aria-label={`View ${product.name} details`}
                    >

                      <div className="image-glow"></div>

                      {product.image ? (

                        <img
                          src={getImageUrl(
                            product.image
                          )}
                          alt={
                            product.name
                          }

                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />

                      ) : (

                        <span>
                          🛍️
                        </span>

                      )}

                    </button>

                    <div className="product-details">

                      <span className="product-category">
                        {product.category}
                      </span>

                      <h3>
                        <button
                          type="button"
                          className="product-name-trigger"
                          onClick={() => openProductQuickView(product)}
                        >
                          {product.name}
                        </button>
                      </h3>

                      <div className="rating">

                        <span>
                          ★★★★★
                        </span>

                        <small>
                          4.8
                        </small>

                      </div>

                      <div className="price-row">

                        <div>

                          {dealsByProductId.has(product.id) ? (
                            <>
                              <strong>₹{formatPrice(dealsByProductId.get(product.id).discountedPrice)}</strong>
                              <del>₹{formatPrice(dealsByProductId.get(product.id).originalPrice)}</del>
                            </>
                          ) : (
                            <strong>₹{formatPrice(product.price)}</strong>
                          )}

                        </div>

                        <button
                          type="button"
                          className="add-cart"
                          title="Add to cart"

                          onClick={() => addToCart(product)}
                        >
                          +
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        {/* NO PRODUCTS */}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (

            <div className="products-message">

              <h3>No matching products</h3>

              <p>
                "Try another category or search term."
              </p>

              <button
                type="button"
                onClick={
                  fetchProducts
                }
                className="primary-btn"
              >
                Refresh Products
              </button>

            </div>

          )}

      </main>

      {/* =================================================
          DEAL BANNER
      ================================================= */}

      <section className="deal-banner">

        <div>

          <span>
            LIMITED TIME OFFER
          </span>

          <h2>
            Upgrade Your Tech.
            <br />
            Save More Today.
          </h2>

          <p>
            Premium products at unbeatable prices.
          </p>

          <button
            type="button"
            onClick={showDeals}
          >
            Shop Deals →
          </button>

        </div>

        <div className="deal-icon">
          💻
        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <div className="footer-brand">

          <div className="shopvia-logo">

            <span className="logo-shape">
              S
            </span>

          </div>

          <div className="brand-text">

            <h2>
              SHOPVIA
            </h2>

            <small>
              SMART COMMERCE
            </small>

          </div>

        </div>

        <p>
          © 2026 SHOPVIA.
          Built for a smarter
          shopping experience.
        </p>

        <div className="footer-links">
          Privacy Policy · Terms · Contact
        </div>

      </footer>

      {/* =================================================
          CART MODAL
      ================================================= */}

      {showCart && (

        <div
          className="cart-overlay"

          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeCart();
            }
          }}
        >

          <div className="cart-modal">

            <div className="cart-header">

              <div>

                <span className="section-label">
                  SHOPPING CART
                </span>

                <h2>
                  Your Cart
                </h2>

                <p>
                  Review your selected products
                </p>

              </div>

              <button
                type="button"
                className="cart-close"
                onClick={
                  closeCart
                }
              >
                ✕
              </button>

            </div>

            {cartLoading ? (

              <div className="cart-message">

                <div className="loader"></div>

                <p>
                  Loading cart...
                </p>

              </div>

            ) : cartItems.length === 0 ? (

              <div className="cart-message">

                <div className="empty-cart-icon">
                  🛒
                </div>

                <h3>
                  Your cart is empty
                </h3>

                <p>
                  Add some products to get started.
                </p>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={
                    closeCart
                  }
                >
                  Continue Shopping
                </button>

              </div>

            ) : (

              <>

                <div className="cart-items">

                  {cartItems.map(
                    (item) => {

                      const itemTotal =
                        Number(
                          item.price || 0
                        ) *
                        Number(
                          item.quantity || 0
                        );

                      const product =
                        getProductById(
                          item.productId
                        );

                      return (

                        <div
                          className="cart-item"
                          key={item.id}
                        >

                          <button
                            type="button"
                            className="cart-item-image cart-quick-view-trigger"
                            onClick={() => product && openProductQuickView(product)}
                            disabled={!product}
                            aria-label={`View ${product?.name || "product"} details`}
                          >

                            {product?.image ? (

                              <img
                                src={getImageUrl(
                                  product.image
                                )}
                                alt={
                                  product.name ||
                                  "Product"
                                }

                                onError={(e) => {
                                  e.currentTarget.style.display =
                                    "none";
                                }}
                              />

                            ) : (

                              <span>
                                🛍️
                              </span>

                            )}

                          </button>

                          <div className="cart-item-info">

                            <h3>
                              <button
                                type="button"
                                className="cart-item-name-trigger"
                                onClick={() => product && openProductQuickView(product)}
                                disabled={!product}
                              >
                                {product?.name || `Product #${item.productId}`}
                              </button>
                            </h3>

                            <p>
                              ₹
                              {formatPrice(
                                item.price
                              )}{" "}
                              per item
                            </p>

                            <div className="quantity-control">

                              <button
                                type="button"

                                onClick={() =>
                                  updateQuantity(
                                    item,
                                    Number(
                                      item.quantity
                                    ) - 1
                                  )
                                }
                              >
                                −
                              </button>

                              <span>
                                {item.quantity}
                              </span>

                              <button
                                type="button"

                                onClick={() =>
                                  updateQuantity(
                                    item,
                                    Number(
                                      item.quantity
                                    ) + 1
                                  )
                                }
                              >
                                +
                              </button>

                            </div>

                          </div>

                          <div className="cart-item-right">

                            <strong>
                              ₹
                              {formatPrice(
                                itemTotal
                              )}
                            </strong>

                            <button
                              type="button"
                              className="remove-cart"

                              onClick={() =>
                                removeFromCart(
                                  item.id
                                )
                              }
                            >
                              Remove
                            </button>

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

                <div className="order-summary">

                  <div className="summary-header">

                    <h3>
                      Order Summary
                    </h3>

                  </div>

                  <div className="summary-row">

                    <span>
                      Items
                    </span>

                    <span>
                      {cartCount}
                    </span>

                  </div>

                  <div className="summary-row">

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹
                      {formatPrice(
                        subtotal
                      )}
                    </strong>

                  </div>

                  <div className="summary-row">

                    <span>
                      Delivery
                    </span>

                    <strong className="free">
                      FREE
                    </strong>

                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {formatPrice(
                        subtotal
                      )}
                    </strong>

                  </div>

                  <button
                    type="button"
                    className="checkout-btn"

                    onClick={() => {
                      closeCart();
                      setPage(
                        "checkout"
                      );
                    }}
                  >
                    Proceed to Checkout →
                  </button>

                  <button
                    type="button"
                    className="continue-btn"
                    onClick={
                      closeCart
                    }
                  >
                    ← Continue Shopping
                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}

      {quickViewProduct && (
        <div
          className="product-quick-view-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeProductQuickView();
            }
          }}
        >
          <section
            className="product-quick-view-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-view-title"
          >
            <button
              type="button"
              className="product-quick-view-close"
              onClick={closeProductQuickView}
              aria-label="Close product details"
            >
              ✕
            </button>

            <ProductImageGallery
              key={quickViewProduct.id}
              images={quickViewImages}
              productName={quickViewProduct.name}
            />

            <div className="product-quick-view-details">
              <span className="product-quick-view-category">
                {quickViewProduct.category || "SHOPVIA PRODUCT"}
              </span>
              <h2 id="quick-view-title">{quickViewProduct.name}</h2>
              <p className="product-quick-view-description">
                {quickViewProduct.description || "A great choice from the SHOPVIA collection."}
              </p>
              <p className="product-quick-view-stock">
                {Number.isFinite(quickViewStock)
                  ? quickViewStock > 0
                    ? `${quickViewStock} in stock`
                    : "Currently out of stock"
                  : "Check availability at checkout"}
              </p>

              <div className="product-quick-view-price">
                <strong>
                  ₹{formatPrice(quickViewDeal?.discountedPrice ?? quickViewProduct.price)}
                </strong>
                {quickViewDeal && (
                  <del>₹{formatPrice(quickViewDeal.originalPrice)}</del>
                )}
              </div>

              <div className="product-quick-view-actions">
                <div className="quantity-control quick-view-quantity">
                  <button
                    type="button"
                    onClick={() => setQuickViewQuantity((quantity) => Math.max(1, quantity - 1))}
                    disabled={quickViewQuantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span aria-live="polite">{quickViewQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuickViewQuantity((quantity) => quantity + 1)}
                    disabled={Number.isFinite(quickViewStock) && quickViewQuantity >= quickViewStock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="product-quick-view-add"
                  onClick={addQuickViewProductToCart}
                  disabled={quickViewAdding || (Number.isFinite(quickViewStock) && quickViewStock <= 0)}
                >
                  {quickViewAdding ? "Adding…" : "Add to cart"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}

export default App;

