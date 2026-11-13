import { useState, useEffect } from "react";
import API from "../api";

function AdminAddProduct({ onNavigate, onProductAdded }) {
  // =====================================================
  // STATES
  // =====================================================

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    images: [""],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    API.get("/categories")
      .then((response) => setCategories(Array.isArray(response.data) ? response.data : []))
      .catch((error) => console.error("Could not load product categories:", error));
  }, []);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error on input change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((image, imageIndex) => (
        imageIndex === index ? value : image
      )),
    }));
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.length === 1
        ? [""]
        : prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.quantity || Number(formData.quantity) < 0) {
      newErrors.quantity = "Stock cannot be negative";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    const imageUrls = formData.images.map((image) => image.trim()).filter(Boolean);
    imageUrls.forEach((image, index) => {
      try {
        const imageUrl = new URL(image);
        if (!['http:', 'https:'].includes(imageUrl.protocol)) {
          newErrors.images = `Image ${index + 1}: use an HTTP or HTTPS URL`;
        }
      } catch {
        newErrors.images = `Image ${index + 1}: enter a valid image URL`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // SUBMIT FORM
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setSuccess("");

      const images = formData.images.map((image) => image.trim()).filter(Boolean);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        category: formData.category.trim(),
        image: images[0] || "",
        images,
      };

      const response = await API.post("/admin/products", payload);
      
      setSuccess("Product added successfully!");
      setFormData({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
        images: [""],
      });

      if (onProductAdded) {
        onProductAdded(response.data);
      }

      // Navigate to products page after 2 seconds
      setTimeout(() => {
        onNavigate("products");
      }, 2000);
    } catch (err) {
      console.error("Error adding product:", err);
      setErrors({
        submit: err.response?.data?.message || "Failed to add product",
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin-main">
      <header className="admin-header">
        <div>
          <h1>Add New Product</h1>
          <p>Add a new product to your inventory</p>
        </div>
        <button
          className="btn-secondary"
          onClick={() => onNavigate("products")}
        >
          ← Back to Products
        </button>
      </header>

      <section className="admin-content">
        <div className="admin-form" style={{ maxWidth: "600px" }}>
          {success && (
            <div
              style={{
                padding: "12px",
                background: "rgba(34, 197, 94, 0.2)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                borderRadius: "6px",
                color: "#22c55e",
                marginBottom: "20px",
              }}
            >
              ✓ {success}
            </div>
          )}

          {errors.submit && (
            <div
              style={{
                padding: "12px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "6px",
                color: "#ef4444",
                marginBottom: "20px",
              }}
            >
              ⚠️ {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* NAME */}
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                style={{
                  borderColor: errors.name ? "#ef4444" : undefined,
                }}
              />
              {errors.name && (
                <small style={{ color: "#ef4444", display: "block", marginTop: "4px" }}>
                  {errors.name}
                </small>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                style={{
                  borderColor: errors.description ? "#ef4444" : undefined,
                }}
              />
              {errors.description && (
                <small style={{ color: "#ef4444", display: "block", marginTop: "4px" }}>
                  {errors.description}
                </small>
              )}
            </div>

            {/* PRICE */}
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                step="0.01"
                min="0"
                style={{
                  borderColor: errors.price ? "#ef4444" : undefined,
                }}
              />
              {errors.price && (
                <small style={{ color: "#ef4444", display: "block", marginTop: "4px" }}>
                  {errors.price}
                </small>
              )}
            </div>

            {/* QUANTITY */}
            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Enter stock quantity"
                min="0"
                style={{
                  borderColor: errors.quantity ? "#ef4444" : undefined,
                }}
              />
              {errors.quantity && (
                <small style={{ color: "#ef4444", display: "block", marginTop: "4px" }}>
                  {errors.quantity}
                </small>
              )}
            </div>

            {/* CATEGORY */}
            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                list="product-categories"
                placeholder="Choose or enter a category"
                style={{
                  borderColor: errors.category ? "#ef4444" : undefined,
                }}
              />
              <datalist id="product-categories">
                {categories.map((category) => (
                  <option key={category.id ?? category.name} value={category.name} />
                ))}
              </datalist>
              {errors.category && (
                <small style={{ color: "#ef4444", display: "block", marginTop: "4px" }}>
                  {errors.category}
                </small>
              )}
            </div>

            {/* IMAGE URLS */}
            <div className="form-group">
              <label>Product image URLs (optional)</label>
              <small style={{ color: "rgba(255, 255, 255, 0.6)", display: "block", marginTop: "4px" }}>
                Add direct HTTPS image links. The first image is used as the product cover.
              </small>
              {formData.images.map((image, index) => (
                <div key={index} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="url"
                      value={image}
                      onChange={(event) => handleImageChange(index, event.target.value)}
                      placeholder={`https://example.com/product-image-${index + 1}.jpg`}
                      aria-label={`Product image URL ${index + 1}`}
                      aria-invalid={Boolean(errors.images)}
                    />
                    {image.trim() && (
                      <img
                        src={image.trim()}
                        alt={`Product image ${index + 1} preview`}
                        loading="lazy"
                        style={{ display: "block", width: "100px", height: "100px", objectFit: "contain", marginTop: "8px", borderRadius: "8px" }}
                        onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
                        onLoad={(event) => { event.currentTarget.style.visibility = "visible"; }}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => removeImageField(index)}
                    aria-label={`Remove product image ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {errors.images && (
                <small role="alert" style={{ color: "#ef4444", display: "block", marginTop: "8px" }}>
                  {errors.images}
                </small>
              )}
              <button type="button" className="btn-secondary" onClick={addImageField} style={{ marginTop: "12px" }}>
                + Add another image
              </button>
            </div>

            {/* SUBMIT */}
            <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? "Adding..." : "Add Product"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onNavigate("products")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AdminAddProduct;
