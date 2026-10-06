import { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";

import { darkTheme, lightTheme } from "../theme/theme";

const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState("dark");

  const theme = useMemo(
    () => (mode === "dark" ? darkTheme : lightTheme),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark: mode === "dark",
        toggleTheme,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useThemeMode must be used inside ThemeContextProvider"
    );
  }

  return context;
};