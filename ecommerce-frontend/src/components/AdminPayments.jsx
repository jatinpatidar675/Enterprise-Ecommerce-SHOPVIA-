import { useState, useEffect } from "react";
import API from "../api";

function AdminPayments() {
  // =====================================================
  // STATES
  // =====================================================

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // =====================================================
  // FETCH PAYMENTS
  // =====================================================

  const fetchPayments = async () => {
    try {
      const response = await API.get("/admin/payments");
      setPayments(response.data || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchPayments, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // =====================================================
  // FILTER PAYMENTS
  // =====================================================

  const filteredPayments = payments.filter(
    (payment) =>
      selectedStatus === "ALL" || payment.status === selectedStatus
  );

  // =====================================================
  // CALCULATE TOTALS
  // =====================================================

  const totalRevenue = filteredPayments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const successCount = filteredPayments.filter(
    (p) => p.status === "SUCCESS"
  ).length;

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
          <h1>Payments</h1>
          <p>Track and manage customer payments</p>
        </div>
      </header>

      <section className="admin-content">
        {/* SUMMARY CARDS */}
        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
            <div style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "20px" }}>
              <p style={{ color: "rgba(255, 255, 255, 0.6)", marginBottom: "5px" }}>Total Revenue</p>
              <strong style={{ fontSize: "24px" }}>₹{totalRevenue.toLocaleString("en-IN")}</strong>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "20px" }}>
              <p style={{ color: "rgba(255, 255, 255, 0.6)", marginBottom: "5px" }}>Successful Payments</p>
              <strong style={{ fontSize: "24px" }}>{successCount}</strong>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "20px" }}>
              <p style={{ color: "rgba(255, 255, 255, 0.6)", marginBottom: "5px" }}>Total Payments</p>
              <strong style={{ fontSize: "24px" }}>{filteredPayments.length}</strong>
            </div>
          </div>
        )}

        {/* STATUS FILTER */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {["ALL", "SUCCESS", "FAILED", "PENDING"].map((status) => (
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
            <p>Loading payments...</p>
          </div>
        ) : error ? (
          <div className="admin-error">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError("");
                fetchPayments();
              }}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="admin-error">
            <h3>No payments found</h3>
            <p>No payments match the selected status</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Order ID</th>
                  <th>User ID</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Razorpay ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>#{payment.id}</td>
                    <td>#{payment.orderId}</td>
                    <td>{payment.userId}</td>
                    <td>₹{payment.amount?.toLocaleString("en-IN") || "0"}</td>
                    <td>{payment.paymentMethod || "N/A"}</td>
                    <td>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          background:
                            payment.status === "SUCCESS"
                              ? "rgba(34, 197, 94, 0.2)"
                              : payment.status === "FAILED"
                              ? "rgba(239, 68, 68, 0.2)"
                              : "rgba(245, 158, 11, 0.2)",
                          color:
                            payment.status === "SUCCESS"
                              ? "#22c55e"
                              : payment.status === "FAILED"
                              ? "#ef4444"
                              : "#f59e0b",
                        }}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                      {payment.razorpayPaymentId
                        ? payment.razorpayPaymentId.substring(0, 12) + "..."
                        : "N/A"}
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

export default AdminPayments;
