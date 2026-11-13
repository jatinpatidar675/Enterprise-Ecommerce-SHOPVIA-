import { useState, useEffect } from "react";
import API from "../api";

function AdminOrders() {
  // =====================================================
  // STATES
  // =====================================================

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  // =====================================================
  // FETCH ORDERS
  // =====================================================

  const fetchOrders = async () => {
    try {
      const response = await API.get("/admin/orders");
      setOrders(response.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchOrders, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await API.put(`/admin/orders/${orderId}/status`, null, {
        params: { status: newStatus },
      });
      
      alert("Order status updated successfully");
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // FILTER ORDERS
  // =====================================================

  const filteredOrders = orders.filter(
    (order) => selectedStatus === "ALL" || order.status === selectedStatus
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin-main">
      <header className="admin-header">
        <div>
          <h1>Orders</h1>
          <p>Manage customer orders</p>
        </div>
      </header>

      <section className="admin-content">
        {/* STATUS FILTER */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {["ALL", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              style={{
                padding: "8px 15px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: selectedStatus === status ? "linear-gradient(135deg, #2563eb, #7c3aed)" : "rgba(255, 255, 255, 0.05)",
                color: "white",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="admin-error">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError("");
                fetchOrders();
              }}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-error">
            <h3>No orders found</h3>
            <p>No orders match the selected status</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User ID</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                  <th>Delivery</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.userId}</td>
                    <td>₹{order.totalAmount?.toLocaleString("en-IN") || "0"}</td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>
                      <strong>{order.customerName || "Customer details unavailable"}</strong>
                      {order.phone && <div>{order.phone}</div>}
                      <div>
                        {[order.deliveryAddress, order.city, order.pincode]
                          .filter(Boolean)
                          .join(", ") || "Delivery address unavailable"}
                      </div>
                      {order.deliveryLatitude != null && order.deliveryLongitude != null && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryLatitude}%2C${order.deliveryLongitude}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View delivery pin
                        </a>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          background:
                            order.status === "DELIVERED"
                              ? "rgba(34, 197, 94, 0.2)"
                              : order.status === "CANCELLED"
                              ? "rgba(239, 68, 68, 0.2)"
                              : "rgba(59, 130, 246, 0.2)",
                          color:
                            order.status === "DELIVERED"
                              ? "#22c55e"
                              : order.status === "CANCELLED"
                              ? "#ef4444"
                              : "#3b82f6",
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status || "PLACED"}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        style={{
                          padding: "6px",
                          borderRadius: "4px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
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

export default AdminOrders;
