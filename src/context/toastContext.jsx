import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import Toast from "../components/toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);
// success, error, warning, info
  const showToast = useCallback(
    ({
      type = "info",
      message,
      title = "",
      duration = 3000,
    }) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast({
        id: Date.now(),
        type,
        title,
        message,
      });

      timeoutRef.current = setTimeout(() => {
        setToast(null);
      }, duration);
    },
    []
  );

  const success = useCallback(
    (message, title = "Success") => {
      showToast({
        type: "success",
        message,
        title,
      });
    },
    [showToast]
  );

  const error = useCallback(
    (message, title = "Error") => {
      showToast({
        type: "error",
        message,
        title,
      });
    },
    [showToast]
  );

  const warning = useCallback(
    (message, title = "Warning") => {
      showToast({
        type: "warning",
        message,
        title,
      });
    },
    [showToast]
  );

  const info = useCallback(
    (message, title = "Info") => {
      showToast({
        type: "info",
        message,
        title,
      });
    },
    [showToast]
  );

  const closeToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast(null);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success,
        error,
        warning,
        info,
        closeToast,
      }}
    >
      {children}

      <Toast
        toast={toast}
        onClose={closeToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider"
    );
  }

  return context;
}