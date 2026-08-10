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

export const createOrder = async (order) => {
  const response = await api.post("/orders", order);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const deleteOrder = async (id) => {
  await api.delete(`/orders/${id}`);
};

export const deleteAllOrders = async () => {
  await api.delete("/orders/all");
};

export const getOrders = async (userId) => {
  const response = await api.get("/orders", {
    params: userId ? { userId } : undefined,
  });
  return response.data;
};
