import { createContext, useContext, useEffect, useState } from "react";

import { authApi } from "../api/Authapi";
import { TOKEN_KEY } from "../api/client";
import { hasPermission } from "../utils/roles";

const AuthContext = createContext(null);

const USER_KEY = "user";

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
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);

        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(USER_KEY);

        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(email, password, remember = false) {
    const { token, user } = await authApi.login(email, password);

    // Clear old auth data from both storages first
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);

    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);

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
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);

    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);

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