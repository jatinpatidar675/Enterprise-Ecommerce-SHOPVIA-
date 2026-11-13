import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const deliveryPinIcon = L.divIcon({
  className: "delivery-pin-icon",
  html: '<span class="delivery-pin-shape"></span>',
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

function DeliveryLocationMap({ location, onLocationChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onLocationChangeRef = useRef(onLocationChange);

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const map = L.map(containerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(map);

    map.on("click", ({ latlng }) => {
      onLocationChangeRef.current({
        latitude: latlng.lat,
        longitude: latlng.lng,
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !location) {
      return;
    }

    const position = [location.latitude, location.longitude];
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    } else {
      markerRef.current = L.marker(position, {
        draggable: true,
        icon: deliveryPinIcon,
      })
        .on("dragend", (event) => {
          const point = event.target.getLatLng();
          onLocationChangeRef.current({
            latitude: point.lat,
            longitude: point.lng,
          });
        })
        .addTo(map);
    }

    map.flyTo(position, Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [location]);

  return <div ref={containerRef} className="delivery-location-map" aria-label="Interactive map to select a delivery location" />;
}

export default DeliveryLocationMap;
