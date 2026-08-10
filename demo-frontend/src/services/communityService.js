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

export const getQuestions = async () => {
  const response = await api.get("/questions");
  return response.data;
};

export const postQuestion = async (question) => {
  const response = await api.post("/questions", question);
  return response.data;
};

export const getAnswersForQuestion = async (questionId) => {
  const response = await api.get(`/questions/${questionId}/answers`);
  return response.data;
};

export const postAnswer = async (answer) => {
  const response = await api.post("/answers", answer);
  return response.data;
};
