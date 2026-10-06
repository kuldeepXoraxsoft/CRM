import axios from "axios";

const TOKEN_KEY = "access_token";
const USER_KEY = "user";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Get token from whichever storage contains it
const getToken = () => {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY)
  );
};

// Attach JWT to every outgoing request
client.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// If token is invalid/expired, clear auth data
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);

      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export {
  TOKEN_KEY,
  USER_KEY,
  getToken,
};

export default client;