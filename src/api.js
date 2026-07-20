import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("wafi_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("wafi_token");
      localStorage.removeItem("wafi_username");
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token, username) {
  if (token) {
    localStorage.setItem("wafi_token", token);
    if (username) localStorage.setItem("wafi_username", username);
  }
}

export function clearAuthToken() {
  localStorage.removeItem("wafi_token");
  localStorage.removeItem("wafi_username");
}

export default api;