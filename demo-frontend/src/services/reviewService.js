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

export const submitReview = async (review) => {
  const response = await api.post("/reviews", review);
  return response.data;
};

export const getReviewsByPractitionerId = async (practitionerId) => {
  const response = await api.get(`/reviews/practitioner/${practitionerId}`);
  return response.data;
};
