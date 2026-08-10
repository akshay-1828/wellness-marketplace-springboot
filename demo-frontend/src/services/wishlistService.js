import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getWishlist = async () => {
  const response = await api.get("/wishlist");
  return response.data;
};

export const getWishlistIds = async () => {
    const response = await api.get("/wishlist/ids");
    return response.data;
};

export const addToWishlist = async (productId) => {
  await api.post(`/wishlist/${productId}`);
};

export const removeFromWishlist = async (productId) => {
  await api.delete(`/wishlist/${productId}`);
};