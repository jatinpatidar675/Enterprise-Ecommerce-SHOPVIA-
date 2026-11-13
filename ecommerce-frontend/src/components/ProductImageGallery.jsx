import { useRef, useState } from "react";

function ProductImageGallery({ images, productName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);

  const selectImage = (index) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    setActiveIndex(index);
    track.scrollTo({
      left: track.clientWidth * index,
      behavior: "smooth",
    });
  };

  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) {
      return;
    }

    const nextIndex = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex((currentIndex) => (
      currentIndex === nextIndex ? currentIndex : nextIndex
    ));
  };

  if (!images.length) {
    return (
      <div className="product-quick-view-gallery product-gallery-empty">
        <span aria-hidden="true">🛍️</span>
      </div>
    );
  }

  return (
    <div className="product-quick-view-gallery">
      {images.length > 1 && (
        <div className="product-gallery-thumbnails" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`product-gallery-thumbnail${index === activeIndex ? " active" : ""}`}
              onClick={() => selectImage(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-pressed={index === activeIndex}
            >
              <img src={image} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <div className="product-gallery-stage">
        <div
          ref={trackRef}
          className="product-gallery-track"
          onScroll={handleTrackScroll}
          aria-label={`${productName} product images`}
        >
          {images.map((image, index) => (
            <div className="product-gallery-slide" key={`${image}-${index}`}>
              <img
                src={image}
                alt={`${productName}, image ${index + 1} of ${images.length}`}
                draggable="false"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="product-gallery-arrow previous"
              onClick={() => selectImage((activeIndex - 1 + images.length) % images.length)}
              aria-label="Show previous product image"
            >
              ‹
            </button>
            <button
              type="button"
              className="product-gallery-arrow next"
              onClick={() => selectImage((activeIndex + 1) % images.length)}
              aria-label="Show next product image"
            >
              ›
            </button>
            <span className="product-gallery-count" aria-live="polite">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductImageGallery;
