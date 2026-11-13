import axios from "axios";

export const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || "http://localhost:8080")
  .replace(/\/+$/, "");

export const getProductImageUrl = (image) => {
  if (!image) return null;
  const value = String(image).trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}/images/${value.replace(/^\/+/, "").replace(/^images\//i, "")}`;
};

const API = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;