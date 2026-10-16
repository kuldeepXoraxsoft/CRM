import { createContext, useContext, useEffect, useState } from "react";

import { authApi } from "../api/Authapi";
import {
  TOKEN_KEY,
  UNAUTHORIZED_EVENT,
  clearAuth,
  getToken,
  getTokenExpiry,
  isTokenExpired,
} from "../api/client";
import { hasPermission } from "../utils/roles";

const AuthContext = createContext(null);

const USER_KEY = "user";

// setTimeout can't handle delays above ~24.8 days
const MAX_TIMEOUT = 2147483647;

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on application load
  useEffect(() => {
    async function restoreSession() {
      const localToken = localStorage.getItem(TOKEN_KEY);
      const sessionToken = sessionStorage.getItem(TOKEN_KEY);

      const token = localToken || sessionToken;

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Token already expired -> no need to ask the backend, go to login now
      if (isTokenExpired(token)) {
        clearAuth();
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // First try stored user
        const localUser = localStorage.getItem(USER_KEY);
        const sessionUser = sessionStorage.getItem(USER_KEY);

        const storedUser = localUser || sessionUser;

        if (storedUser) {
          try {
            setCurrentUser(JSON.parse(storedUser));
          } catch {
            console.warn("Invalid stored user data");
          }
        }

        // Verify token with backend
        const { user } = await authApi.me();

        setCurrentUser(user);

        // Keep user in the same storage where token exists
        if (localToken) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        } else {
          sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        }

      } catch (error) {
        // Invalid/expired token
        clearAuth();
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  // While logged in: watch for the session ending (expiry, 401, other tab logout)
  useEffect(() => {
    if (!currentUser) return undefined;

    const expireSession = () => {
      clearAuth();
      setCurrentUser(null); // ProtectedRoute redirects to login instantly
    };

    // 1) Log out exactly when the JWT expires (even if the user is idle)
    let timer;
    const expiry = getTokenExpiry(getToken());

    if (expiry) {
      const delay = Math.max(expiry - Date.now(), 0);
      timer = setTimeout(() => {
        if (isTokenExpired()) expireSession();
      }, Math.min(delay, MAX_TIMEOUT));
    }

    // 2) Browsers throttle timers in background tabs / after laptop sleep,
    //    so check again whenever the user comes back to the tab
    const checkOnReturn = () => {
      if (document.visibilityState === "visible" && isTokenExpired()) {
        expireSession();
      }
    };

    // 3) API returned 401 (client.js already cleared storage)
    const handleUnauthorized = () => setCurrentUser(null);

    // 4) User logged out in another tab (localStorage token removed)
    const handleStorage = (e) => {
      if (e.key === TOKEN_KEY && !e.newValue && !getToken()) {
        setCurrentUser(null);
      }
    };

    document.addEventListener("visibilitychange", checkOnReturn);
    window.addEventListener("focus", checkOnReturn);
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    window.addEventListener("storage", handleStorage);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", checkOnReturn);
      window.removeEventListener("focus", checkOnReturn);
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
      window.removeEventListener("storage", handleStorage);
    };
  }, [currentUser]);

  async function login(email, password, remember = false) {
    const { token, user } = await authApi.login(email, password);

    // Clear old auth data from both storages first
    clearAuth();

    // Remember me = localStorage
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    // Remember me unchecked = sessionStorage
    else {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    setCurrentUser(user);

    return user;
  }

  function logout() {
    clearAuth();
    setCurrentUser(null);
  }

  function can(permissionKey) {
    if (!currentUser) return false;

    return hasPermission(
      currentUser.role,
      permissionKey
    );
  }

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    can,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an <AuthProvider>"
    );
  }

  return context;
}