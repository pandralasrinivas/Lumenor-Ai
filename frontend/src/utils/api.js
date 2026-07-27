import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "https://lumenor-ai.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      const isAdminPath = window.location.pathname.startsWith("/store/admin");
      window.location.href = isAdminPath ? "/store/admin/login" : "/login";
    }
    return Promise.reject(error);
  },
);

export const downloadBlobFile = (blob, filename) => {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

export const productAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
};

export const cartAPI = {
  get: () => api.get("/cart"),
  add: (data) => api.post("/cart/add", data),
  update: (data) => api.put("/cart/update", data),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  applyCoupon: (data) => api.post("/cart/coupon", data),
  clear: () => api.delete("/cart/clear"),
};

export const orderAPI = {
  create: (data) => api.post("/orders", data),
  getAll: () => api.get("/orders"),
  getById: (id) => api.get(`/orders/${id}`),
  generateInvoice: (id) =>
    api.get(`/orders/${id}/invoice`, { responseType: "blob" }),
};

export const addressAPI = {
  getAll: () => api.get("/addresses"),
  create: (data) => api.post("/addresses", data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
};

export const recommendationAPI = {
  getByRecentlyViewed: () => api.get("/recommendations/recently-viewed"),
  getByPurchaseHistory: () => api.get("/recommendations/purchase-history"),
  getPersonalized: (params) =>
    api.get("/recommendations/personalized", { params }),
  addViewed: (data) => api.post("/recommendations/add-viewed", data),
};

export const adminAPI = {
  getOverview: () => api.get("/admin/overview"),
  getProducts: (params) => api.get("/admin/products", { params }),
  getLowStockProducts: () => api.get("/admin/products/low-stock"),
  createProduct: (data) => api.post("/admin/products", data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  archiveProduct: (id) => api.delete(`/admin/products/${id}`),
  restoreProduct: (id) => api.patch(`/admin/products/${id}/restore`),
  getOrders: (params) => api.get("/admin/orders", { params }),
  getOrderById: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) =>
    api.patch(`/admin/orders/${id}/status`, data),
};

export const reviewAPI = {
  create: (data) => api.post("/reviews", data),
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export default api;
