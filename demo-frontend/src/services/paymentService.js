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

export const getPaymentsByOrderId = async (orderId) => {
  const response = await api.get(`/payments/by-order/${orderId}`);
  return response.data;
};

export const createCodPayment = async ({ orderId }) => {
  const response = await api.post("/payments/cod", { orderId });
  return response.data;
};

export const chargeCardPayment = async ({
  orderId,
  nameOnCard,
  cardNumber,
  expiryMonth,
  expiryYear,
  cvc,
}) => {
  const response = await api.post("/payments/card", {
    orderId,
    nameOnCard,
    cardNumber,
    expiryMonth,
    expiryYear,
    cvc,
  });
  return response.data;
};


