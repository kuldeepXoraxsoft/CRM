import axios from "axios";

const TOKEN_KEY = "access_token";
const USER_KEY = "user";

const UNAUTHORIZED_EVENT = "auth:unauthorized";

const PUBLIC_AUTH_URL = /\/auth\/(login|forgot-password|reset-password)/;

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

// Read `exp` from the JWT (milliseconds). Returns null if it can't be read.
const getTokenExpiry = (token = getToken()) => {
  if (!token) return null;

  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

// true if there is a token and it has already expired (5s clock-skew buffer)
const isTokenExpired = (token = getToken()) => {
  const expiry = getTokenExpiry(token);
  return expiry !== null && Date.now() >= expiry - 5000;
};

const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);

  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
};

// Clear storage + tell the app the session is over
const notifyUnauthorized = () => {
  clearAuth();
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
};

// Attach JWT to every outgoing request
client.interceptors.request.use((config) => {
  if (PUBLIC_AUTH_URL.test(config.url || "")) {
    return config;
  }

  const token = getToken();

  if (token) {
    // Token already expired -> don't even call the API, log out right now
    if (isTokenExpired(token)) {
      notifyUnauthorized();
      return Promise.reject(new axios.CanceledError("Session expired"));
    }

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// If the server says the token is invalid/expired, log out instantly
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublic = PUBLIC_AUTH_URL.test(error.config?.url || "");

    if (error.response?.status === 401 && !isPublic) {
      notifyUnauthorized();
    }

    return Promise.reject(error);
  }
);

export {
  TOKEN_KEY,
  USER_KEY,
  UNAUTHORIZED_EVENT,
  getToken,
  getTokenExpiry,
  isTokenExpired,
  clearAuth,
};

export default client;