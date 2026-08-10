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

export const getProductReviews = async (productId) => {
  const response = await api.get(`/product-reviews/product/${productId}`);
  return response.data;
};

export const submitProductReview = async (review) => {
  const response = await api.post("/product-reviews", review);
  return response.data;
};

export const submitProductReviewWithMedia = async ({ userId, productId, rating, comment, media }) => {
  const formData = new FormData();
  formData.append("userId", String(userId));
  formData.append("productId", String(productId));
  formData.append("rating", String(rating));
  if (comment) {
    formData.append("comment", comment);
  }
  if (media) {
    formData.append("media", media);
  }

  const response = await api.post("/product-reviews/upload", formData);
  return response.data;
};

export const getReviewMediaUrl = (mediaUrl) => {
  if (!mediaUrl) return null;
  if (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://")) return mediaUrl;
  const baseUrlHost = API_BASE_URL.replace("/api", "");
  return `${baseUrlHost}${mediaUrl.startsWith("/") ? "" : "/"}${mediaUrl}`;
};

export const deleteProductReview = async (id, userId) => {
  const response = await api.delete(`/product-reviews/${id}`, {
    params: { userId },
  });
  return response.data;
};
