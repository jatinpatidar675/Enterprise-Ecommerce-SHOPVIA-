import { useEffect, useState } from "react";
import API from "../api";

const emptyCategory = { name: "", description: "", image: "", parentId: "", active: true };

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      setError("");
      const response = await API.get("/admin/categories");
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(loadCategories, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const resetForm = () => {
    setForm(emptyCategory);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      parentId: form.parentId ? Number(form.parentId) : null,
    };
    try {
      if (editingId) {
        await API.put(`/admin/categories/${editingId}`, payload);
      } else {
        await API.post("/admin/categories", payload);
      }
      resetForm();
      await loadCategories();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save this category.");
    } finally {
      setSaving(false);
    }
  };

  const editCategory = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      parentId: category.parentId || "",
      active: true,
    });
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await API.delete(`/admin/categories/${category.id}`);
      await loadCategories();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Category could not be deleted.");
    }
  };

  return (
    <main className="admin-main">
      <header className="admin-header">
        <div>
          <h1>Categories</h1>
          <p>Manage product categories and subcategories</p>
        </div>
      </header>
      <section className="admin-content">
        {error && <p className="admin-error" role="alert">{error}</p>}
        <form className="quick-actions" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit category" : "New category"}</h2>
          <div className="category-form-grid">
            <label>Name<input required maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Parent category<select value={form.parentId} onChange={(event) => setForm({ ...form, parentId: event.target.value })}>
              <option value="">Top-level category</option>
              {categories.filter((category) => category.id !== editingId).map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select></label>
            <label>Image URL<input type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></label>
            <label>Description<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Create category"}</button>
            {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
        {loading ? <p className="admin-loading">Loading categories…</p> : categories.length === 0 ? (
          <div className="admin-error"><h3>No managed categories yet</h3><p>Existing product categories remain available to customers.</p></div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>Category</th><th>Parent</th><th>Products</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>{categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{categories.find((item) => item.id === category.parentId)?.name || "Top level"}</td>
                  <td>{category.productCount}</td>
                  <td>{category.description}</td>
                  <td className="admin-row-actions">
                    <button type="button" className="btn-secondary" onClick={() => editCategory(category)}>Edit</button>
                    <button type="button" className="btn-danger" onClick={() => deleteCategory(category)}>Delete</button>
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

export default AdminCategories;