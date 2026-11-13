import { useState } from "react";
import AdminAddProduct from "./AdminAddProduct";
import AdminCategories from "./AdminCategories";
import AdminDeals from "./AdminDeals";
import AdminDashboard from "./AdminDashboard";
import AdminOrders from "./AdminOrders";
import AdminPayments from "./AdminPayments";
import AdminProducts from "./AdminProducts";
import AdminStockManagement from "./AdminStockManagement";
import ThemeToggle from "./ThemeToggle";
import "./AdminDashboard.css";

const navigation = [
  ["dashboard", "Dashboard"],
  ["products", "Products"],
  ["add-product", "Add product"],
  ["stock", "Inventory"],
  ["categories", "Categories"],
  ["deals", "Deals & offers"],
  ["orders", "Orders"],
  ["payments", "Payments"],
];

function AdminPanel({ user, onLogout, theme, onToggleTheme }) {
  const [activePage, setActivePage] = useState("dashboard");

  if (activePage === "dashboard") {
    return (
      <>
        <ThemeToggle
          theme={theme}
          onToggle={onToggleTheme}
          className="theme-toggle-float"
        />
        <AdminDashboard
          user={user}
          onLogout={onLogout}
          onNavigate={setActivePage}
        />
      </>
    );
  }

  const renderActivePage = () => {
    switch (activePage) {
      case "products":
        return <AdminProducts onNavigate={setActivePage} />;
      case "add-product":
        return (
          <AdminAddProduct
            onNavigate={setActivePage}
            onProductAdded={() => setActivePage("products")}
          />
        );
      case "stock":
        return <AdminStockManagement onNavigate={setActivePage} />;
      case "categories":
        return <AdminCategories />;
      case "deals":
        return <AdminDeals onNavigate={setActivePage} />;
      case "orders":
        return <AdminOrders />;
      case "payments":
        return <AdminPayments />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span>S</span>
          <div>
            <h3>ShopVia</h3>
            <small>Admin workspace</small>
          </div>
        </div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navigation.map(([page, label]) => (
            <button
              key={page}
              type="button"
              className={`admin-nav-item ${activePage === page ? "active" : ""}`}
              onClick={() => setActivePage(page)}
            >
              {label}
            </button>
          ))}
          <button type="button" className="admin-nav-item logout" onClick={onLogout}>
            Log out
          </button>
        </nav>
      </aside>
      <ThemeToggle
        theme={theme}
        onToggle={onToggleTheme}
        className="theme-toggle-float admin-theme-toggle"
      />
      {renderActivePage()}
    </div>
  );
}

export default AdminPanel;