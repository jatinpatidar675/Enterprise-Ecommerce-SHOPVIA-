import "./AdminDashboard.css";
import { useState, useEffect } from "react";
import API from "../api";

function AdminDashboard({ user, onLogout, onNavigate }) {
  // =====================================================
  // STATES
  // =====================================================

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  const fetchDashboardData = async () => {
    try {
      // Fetch products
      const productsResponse = await API.get("/products");
      const products = productsResponse.data || [];

      // Fetch orders
      const ordersResponse = await API.get("/admin/orders");
      const orders = ordersResponse.data || [];

      // Fetch payments
      const paymentsResponse = await API.get("/admin/payments");
      const payments = paymentsResponse.data || [];

      // Calculate stats
      const totalStock = products.reduce(
        (sum, p) => sum + (p.quantity || 0),
        0
      );

      const lowStockProducts = products.filter(
        (p) => p.quantity <= 5
      ).length;

      const totalRevenue = payments
        .filter((p) => p.status === "SUCCESS")
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        totalProducts: products.length,
        totalStock: totalStock,
        lowStockProducts: lowStockProducts,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchDashboardData, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span>S</span>
          <div>
            <h3>ShopVia</h3>
            <small>Admin</small>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className="admin-nav-item active"
            onClick={() => onNavigate("dashboard")}
          >
            📊 Dashboard
          </button>
          <button
            className="admin-nav-item"
            onClick={() => onNavigate("products")}
          >
            📦 Products
          </button>
          <button
            className="admin-nav-item"
            onClick={() => onNavigate("add-product")}
          >
            ➕ Add Product
          </button>
          <button
            className="admin-nav-item"
            onClick={() => onNavigate("stock")}
          >
            📊 Stock Management
          </button>
          <button
            className="admin-nav-item"
            onClick={() => onNavigate("categories")}
          >
            Categories
          </button>
          <button
            className="admin-nav-item"
            onClick={() => onNavigate("deals")}
          >
            Deals &amp; Offers
          </button>
          <button
            className="admin-nav-item"
            onClick={() => onNavigate("orders")}
          >
            📋 Orders
          </button>
          <button
            className="admin-nav-item"
            onClick={() => onNavigate("payments")}
          >
            💳 Payments
          </button>
          <button className="admin-nav-item logout" onClick={onLogout}>
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name || "Admin"}</p>
          </div>
          <div className="admin-user">
            <span>{user?.email}</span>
            <button onClick={onLogout} title="Logout">
              🚪
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <section className="admin-content">
          {loading ? (
            <div className="admin-loading">
              <div className="spinner"></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : error ? (
            <div className="admin-error">
              <h3>⚠️ Error</h3>
              <p>{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError("");
                  fetchDashboardData();
                }}
                className="primary-btn"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div>
                  <strong>{stats.totalProducts}</strong>
                  <p>Total Products</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div>
                  <strong>{stats.totalStock}</strong>
                  <p>Total Stock</p>
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">⚠️</div>
                <div>
                  <strong>{stats.lowStockProducts}</strong>
                  <p>Low Stock Items</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div>
                  <strong>{stats.totalOrders}</strong>
                  <p>Total Orders</p>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">💰</div>
                <div>
                  <strong>₹{stats.totalRevenue.toLocaleString("en-IN")}</strong>
                  <p>Total Revenue</p>
                </div>
              </div>
            </div>
          )}

          {/* QUICK ACTIONS */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button
                className="action-btn"
                onClick={() => onNavigate("add-product")}
              >
                ➕ Add New Product
              </button>
              <button
                className="action-btn"
                onClick={() => onNavigate("stock")}
              >
                📊 Update Stock
              </button>
              <button
                className="action-btn"
                onClick={() => onNavigate("categories")}
              >
                Manage Categories
              </button>
              <button
                className="action-btn"
                onClick={() => onNavigate("deals")}
              >
                Manage Deals
              </button>
              <button
                className="action-btn"
                onClick={() => onNavigate("orders")}
              >
                📋 View Orders
              </button>
              <button
                className="action-btn"
                onClick={() => onNavigate("payments")}
              >
                💳 View Payments
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
