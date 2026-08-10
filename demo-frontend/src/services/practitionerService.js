import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance with token interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT token
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

export const createPractitionerProfile = async (profileData) => {
  return api.post("/practitioner/profile", profileData);
};

export const getMyPractitionerProfile = async () => {
  return api.get("/practitioner/profile");
};

export const getPractitionerProfileByUserId = async (userId) => {
  return api.get(`/practitioner/user/${userId}`);
};

export const getPractitionerProfile = async (id) => {
  return api.get(`/practitioner/${id}`);
};

export const getVerifiedPractitioners = async () => {
  return api.get("/practitioner/verified");
};

export const getUserDashboard = async () => {
  return api.get("/user/dashboard");
};
export const getPractitionerEarnings = async () => {
  return api.get("/practitioner/me/earnings");
};
