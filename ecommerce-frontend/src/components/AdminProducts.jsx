import { useState, useEffect } from "react";
import API, { getProductImageUrl } from "../api";

function AdminProducts({ onNavigate }) {
  // =====================================================
  // STATES
  // =====================================================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFields, setImageFields] = useState([""]);
  const [imageError, setImageError] = useState("");
  const [savingImages, setSavingImages] = useState(false);
  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
    try {
      const response = await API.get("/products");
      setProducts(response.data || []);
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
  // DELETE PRODUCT
  // =====================================================

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await API.delete(`/admin/products/${id}`);
      alert("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin-main">
      <header className="admin-header">
        <div>
          <h1>Products</h1>
          <p>Manage your products</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => onNavigate("add-product")}
        >
          ➕ Add Product
        </button>
      </header>

      <section className="admin-content">
        {/* SEARCH */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "white",
            }}
          />
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="admin-error">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError("");
                fetchProducts();
              }}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-error">
            <h3>No products found</h3>
            <p>Start by adding your first product</p>
            <button
              onClick={() => onNavigate("add-product")}
              className="btn-primary"
            >
              Add Product
            </button>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Gallery</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>
                      {(product.image || product.images?.[0]) ? (
                        <img
                          src={getProductImageUrl(product.image || product.images[0])}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = "🛍️";
                            e.target.style.fontSize = "24px";
                          }}
                        />
                      ) : (
                        <span>🛍️</span>
                      )}
                    </td>
                    <td>{(product.images?.length || (product.image ? 1 : 0))} image(s)</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>₹{product.price.toLocaleString("en-IN")}</td>
                    <td>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          background:
                            product.quantity <= 5
                              ? "rgba(239, 68, 68, 0.2)"
                              : "rgba(34, 197, 94, 0.2)",
                          color:
                            product.quantity <= 5 ? "#ef4444" : "#22c55e",
                        }}
                      >
                        {product.quantity}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        style={{ marginRight: "5px" }}
                        onClick={() => onNavigate("stock")}
                      >
                        Edit Stock
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}

export default AdminProducts;
