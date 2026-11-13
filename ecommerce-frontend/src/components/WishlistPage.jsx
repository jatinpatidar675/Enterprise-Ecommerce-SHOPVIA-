import "./WishlistPage.css";

function WishlistPage({
  items = [],
  loading = false,
  error = "",
  formatPrice,
  getImageUrl,
  onBack,
  onRemove,
  onMoveToCart,
}) {
  return (
    <main className="wishlist-page">
      <div className="wishlist-shell">
        <header className="wishlist-header">
          <div>
            <span className="wishlist-kicker">YOUR SAVED FINDS</span>
            <h1>Wishlist</h1>
            <p>{items.length} {items.length === 1 ? "product" : "products"} saved</p>
          </div>
          <button type="button" className="wishlist-back" onClick={onBack}>
            Back to shop
          </button>
        </header>

        {error && <p className="wishlist-error" role="alert">{error}</p>}
        {loading ? (
          <div className="wishlist-empty" role="status">Loading your wishlist…</div>
        ) : items.length === 0 ? (
          <div className="wishlist-empty">
            <span aria-hidden="true">♡</span>
            <h2>Your wishlist is empty</h2>
            <p>Save products from the shop and they’ll be waiting here.</p>
            <button type="button" className="wishlist-primary" onClick={onBack}>Browse products</button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((item) => (
              <article className="wishlist-card" key={item.id}>
                <div className="wishlist-image">
                  {item.image ? <img src={getImageUrl(item.image)} alt={item.name} /> : <span aria-hidden="true">◇</span>}
                  <button
                    type="button"
                    className="wishlist-remove"
                    aria-label={`Remove ${item.name} from wishlist`}
                    onClick={() => onRemove(item.productId)}
                  >
                    ×
                  </button>
                </div>
                <div className="wishlist-details">
                  <span className="wishlist-category">{item.category || "ShopVia"}</span>
                  <h2>{item.name}</h2>
                  <p className="wishlist-description">{item.description}</p>
                  <strong className="wishlist-price">₹{formatPrice(item.price)}</strong>
                  <p className={item.available ? "wishlist-stock available" : "wishlist-stock unavailable"}>
                    {item.available ? `${item.stock} in stock` : "Out of stock"}
                  </p>
                  <button
                    type="button"
                    className="wishlist-primary"
                    disabled={!item.available}
                    onClick={() => onMoveToCart(item.productId)}
                  >
                    Move to cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default WishlistPage;