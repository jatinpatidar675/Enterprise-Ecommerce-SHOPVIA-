import { useState, useEffect } from "react";
import API from "../api";

function AdminStockManagement({ onNavigate }) {
  // =====================================================
  // STATES
  // =====================================================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [stockUpdates, setStockUpdates] = useState({});

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/products");
      const allProducts = response.data || [];
      
      // Filter low stock products
      const lowStockProducts = allProducts.filter((p) => p.quantity <= 10);
      setProducts(lowStockProducts);
      
      // Initialize stock updates
      const updates = {};
      lowStockProducts.forEach((p) => {
        updates[p.id] = p.quantity;
      });
      setStockUpdates(updates);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchProducts, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // =====================================================
  // UPDATE STOCK
  // =====================================================

  const handleUpdateStock = async (productId) => {
    const newQuantity = stockUpdates[productId];

    if (newQuantity === undefined || newQuantity < 0) {
      alert("Invalid quantity");
      return;
    }

    try {
      setUpdatingId(productId);
      await API.put(`/admin/products/${productId}/stock`, null, {
        params: { quantity: newQuantity },
      });
      
      alert("Stock updated successfully");
      fetchProducts();
    } catch (err) {
      console.error("Error updating stock:", err);
      alert(err.response?.data?.message || "Failed to update stock");
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin-main">
      <header className="admin-header">
        <div>
          <h1>Stock Management</h1>
          <p>Manage product inventory and stock levels</p>
        </div>
      </header>

      <section className="admin-content">
        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="admin-error">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button onClick={fetchProducts} className="btn-primary">
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="admin-error">
            <h3>✓ All products have sufficient stock</h3>
            <p>No low stock items to manage</p>
            <button
              onClick={() => onNavigate("products")}
              className="btn-primary"
            >
              View All Products
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "20px", padding: "15px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "6px", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
              <strong>⚠️ {products.length} products</strong> have stock &le; 10 units
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>New Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            background: "rgba(239, 68, 68, 0.2)",
                            color: "#ef4444",
                          }}
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={stockUpdates[product.id] || ""}
                          onChange={(e) =>
                            setStockUpdates((prev) => ({
                              ...prev,
                              [product.id]: Number(e.target.value),
                            }))
                          }
                          style={{
                            width: "100px",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(255, 255, 255, 0.05)",
                            color: "white",
                          }}
                        />
                      </td>
                      <td>
                        <button
                          className="btn-primary"
                          onClick={() => handleUpdateStock(product.id)}
                          disabled={updatingId === product.id}
                        >
                          {updatingId === product.id ? "Updating..." : "Update"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default AdminStockManagement;
