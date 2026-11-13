import { useEffect, useState } from "react";
import API from "../api";

const emptyDeal = {
  title: "",
  dealType: "TODAY",
  productId: "",
  discountPercent: "",
  startsAt: "",
  endsAt: "",
  active: true,
};

function AdminDeals({ onNavigate }) {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyDeal);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");
      const [dealResponse, productResponse] = await Promise.all([
        API.get("/admin/deals"),
        API.get("/products"),
      ]);
      setDeals(Array.isArray(dealResponse.data) ? dealResponse.data : []);
      setProducts(Array.isArray(productResponse.data) ? productResponse.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load deals and products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const resetForm = () => {
    setForm(emptyDeal);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      productId: Number(form.productId),
      discountPercent: Number(form.discountPercent),
      startsAt: form.startsAt,
      endsAt: form.endsAt,
    };
    try {
      if (editingId) await API.put(`/admin/deals/${editingId}`, payload);
      else await API.post("/admin/deals", payload);
      resetForm();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save this deal.");
    } finally {
      setSaving(false);
    }
  };

  const editDeal = (deal) => {
    setEditingId(deal.id);
    setForm({
      title: deal.title,
      dealType: deal.dealType,
      productId: String(deal.productId),
      discountPercent: String(deal.discountPercent),
      startsAt: new Date(deal.startsAt).toISOString().slice(0, 16),
      endsAt: new Date(deal.endsAt).toISOString().slice(0, 16),
      active: deal.active,
    });
  };

  const toggleDeal = async (deal) => {
    try {
      await API.put(`/admin/deals/${deal.id}/active`, null, { params: { active: !deal.active } });
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not change deal status.");
    }
  };

  const deleteDeal = async (deal) => {
    if (!window.confirm(`Delete deal "${deal.title}"?`)) return;
    try {
      await API.delete(`/admin/deals/${deal.id}`);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete this deal.");
    }
  };

  return (
    <main className="admin-main">
      <header className="admin-header"><div><h1>Deals &amp; Offers</h1><p>Manage product discounts and validity windows</p></div></header>
      <section className="admin-content">
        {error && <p className="admin-error" role="alert">{error}</p>}
        {!loading && products.length === 0 && (
          <div className="admin-error" role="status">
            <h3>No products available for a deal</h3>
            <p>Add a product first. Deals always reference real products and stock.</p>
            <button type="button" className="btn-primary" onClick={() => onNavigate("add-product")}>
              Add product
            </button>
          </div>
        )}
        <form className="quick-actions" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit deal" : "Create deal"}</h2>
          <div className="category-form-grid">
            <label>Title<input required maxLength="140" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
            <label>Deal type<select value={form.dealType} onChange={(event) => setForm({ ...form, dealType: event.target.value })}>
              <option value="TODAY">Today's Deals</option><option value="FLASH">Flash Sale</option><option value="BEST">Best Deals</option><option value="FEATURED">Featured</option>
            </select></label>
            <label>Product<select required value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })}>
              <option value="">Select product</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name} · ₹{product.price}</option>)}
            </select></label>
            <label>Discount (%)<input type="number" required min="0.01" max="100" step="0.01" value={form.discountPercent} onChange={(event) => setForm({ ...form, discountPercent: event.target.value })} /></label>
            <label>Starts<input type="datetime-local" required value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></label>
            <label>Ends<input type="datetime-local" required value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} /></label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn-primary" disabled={saving || products.length === 0}>{saving ? "Saving…" : editingId ? "Save changes" : "Create deal"}</button>
            {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
        {loading ? <p className="admin-loading">Loading deals…</p> : deals.length === 0 ? (
          <div className="admin-error"><h3>No deals created</h3><p>Create a dated offer linked to a product to publish it.</p></div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>Deal</th><th>Product</th><th>Type</th><th>Discount</th><th>Validity</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{deals.map((deal) => (
                <tr key={deal.id}>
                  <td>{deal.title}</td><td>{deal.productName}</td><td>{deal.dealType}</td>
                  <td>{deal.discountPercent}%</td><td>{new Date(deal.startsAt).toLocaleString()} – {new Date(deal.endsAt).toLocaleString()}</td>
                  <td>{deal.active ? "Active" : "Paused"}</td>
                  <td className="admin-row-actions">
                    <button type="button" className="btn-secondary" onClick={() => editDeal(deal)}>Edit</button>
                    <button type="button" className="btn-secondary" onClick={() => toggleDeal(deal)}>{deal.active ? "Pause" : "Activate"}</button>
                    <button type="button" className="btn-danger" onClick={() => deleteDeal(deal)}>Delete</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDeals;