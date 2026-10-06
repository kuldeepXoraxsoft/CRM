import { createTheme } from "@mui/material/styles";

const common = {
//   typography: {
//     fontFamily: [
//       "Inter",
//       "Roboto",
//       "Helvetica Neue",
//       "Arial",
//       "sans-serif",
//     ].join(","),

//     h1: { fontWeight: 700, fontSize: "2rem" },
//     h2: { fontWeight: 700, fontSize: "1.75rem" },
//     h3: { fontWeight: 600, fontSize: "1.5rem" },
//     h4: { fontWeight: 600, fontSize: "1.25rem" },
//     h5: { fontWeight: 600, fontSize: "1.125rem" },
//     h6: { fontWeight: 600, fontSize: "1rem" },

//     body1: { fontSize: "0.875rem" },
//     body2: { fontSize: "0.8125rem" },

//     button: {
//       textTransform: "none",
//       fontWeight: 600,
//     },
//   },

  shape: {
    borderRadius: 10,
  },
};

/* =========================
   DARK THEME
========================= */

export const darkTheme = createTheme({
  ...common,

  palette: {
    mode: "dark",

    primary: {
      main: "#6366F1",
      light: "#818CF8",
      dark: "#4F46E5",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#8B5CF6",
      light: "#A78BFA",
      dark: "#7C3AED",
      contrastText: "#FFFFFF",
    },

    success: {
      main: "#22C55E",
      light: "#4ADE80",
      dark: "#16A34A",
      contrastText: "#FFFFFF",
    },

    warning: {
      main: "#F59E0B",
      light: "#FBBF24",
      dark: "#D97706",
      contrastText: "#FFFFFF",
    },

    error: {
      main: "#EF4444",
      light: "#F87171",
      dark: "#DC2626",
      contrastText: "#FFFFFF",
    },

    info: {
      main: "#3B82F6",
      light: "#60A5FA",
      dark: "#2563EB",
      contrastText: "#FFFFFF",
    },

    background: {
      default: "#0B0F19",
      paper: "#111827",
    },

    text: {
      primary: "#F9FAFB",
      secondary: "#9CA3AF",
      disabled: "#6B7280",
    },

    divider: "#1F2937",
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor: "#0B0F19",
        },

        body: {
          margin: 0,
          backgroundColor: "#0B0F19",
          color: "#F9FAFB",
          scrollbarColor: "#374151 #111827",
        },

        "*::-webkit-scrollbar": {
          width: 8,
          height: 8,
        },

        "*::-webkit-scrollbar-track": {
          background: "#111827",
        },

        "*::-webkit-scrollbar-thumb": {
          background: "#374151",
          borderRadius: 8,
        },

        "*::-webkit-scrollbar-thumb:hover": {
          background: "#4B5563",
        },

        "::selection": {
          backgroundColor: "#6366F1",
          color: "#FFFFFF",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#111827",
          border: "1px solid #1F2937",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#111827",
          backgroundImage: "none",
          border: "1px solid #1F2937",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
          transition: "all 0.2s ease",

          "&:hover": {
            borderColor: "#374151",
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 38,
          boxShadow: "none",

          "&:hover": {
            boxShadow: "none",
          },
        },

        containedPrimary: {
          backgroundColor: "#6366F1",

          "&:hover": {
            backgroundColor: "#4F46E5",
          },
        },

        outlined: {
          borderColor: "#374151",

          "&:hover": {
            borderColor: "#6366F1",
            backgroundColor: "rgba(99, 102, 241, 0.08)",
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#9CA3AF",

          "&:hover": {
            color: "#F9FAFB",
            backgroundColor: "#1F2937",
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#0F172A",
          borderRadius: 8,

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#374151",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#4B5563",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#6366F1",
            borderWidth: 1,
          },
        },

        input: {
          color: "#F9FAFB",

          "&::placeholder": {
            color: "#6B7280",
            opacity: 1,
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#9CA3AF",

          "&.Mui-focused": {
            color: "#818CF8",
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        select: {
          backgroundColor: "#0F172A",
        },

        icon: {
          color: "#9CA3AF",
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#111827",
          border: "1px solid #1F2937",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.45)",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 40,
          color: "#D1D5DB",

          "&:hover": {
            backgroundColor: "#1F2937",
          },

          "&.Mui-selected": {
            backgroundColor: "rgba(99, 102, 241, 0.15)",
            color: "#A5B4FC",

            "&:hover": {
              backgroundColor: "rgba(99, 102, 241, 0.22)",
            },
          },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#111827",
          backgroundImage: "none",
          border: "1px solid #1F2937",
          borderRadius: 12,
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.55)",
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: "#F9FAFB",
          fontWeight: 600,
          borderBottom: "1px solid #1F2937",
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: "#D1D5DB",
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "12px 20px",
          borderTop: "1px solid #1F2937",
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: "#111827",
          border: "1px solid #1F2937",
          borderRadius: 10,
        },
      },
    },

    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: "#111827",
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#0F172A",
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #1F2937",
          color: "#D1D5DB",
        },

        head: {
          color: "#9CA3AF",
          fontWeight: 600,
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.15s ease",

          "&:hover": {
            backgroundColor: "#151E2E",
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },

        colorDefault: {
          backgroundColor: "#1F2937",
          color: "#D1D5DB",
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#1F2937",
          color: "#F9FAFB",
          fontSize: "0.75rem",
          border: "1px solid #374151",
        },

        arrow: {
          color: "#1F2937",
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid",
        },

        standardSuccess: {
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          color: "#86EFAC",
          borderColor: "rgba(34, 197, 94, 0.25)",
        },

        standardError: {
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          color: "#FCA5A5",
          borderColor: "rgba(239, 68, 68, 0.25)",
        },

        standardWarning: {
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          color: "#FCD34D",
          borderColor: "rgba(245, 158, 11, 0.25)",
        },

        standardInfo: {
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          color: "#93C5FD",
          borderColor: "rgba(59, 130, 246, 0.25)",
        },
      },
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: "#9CA3AF",
          borderColor: "#374151",

          "&:hover": {
            backgroundColor: "#1F2937",
          },

          "&.Mui-selected": {
            backgroundColor: "#6366F1",
            color: "#FFFFFF",

            "&:hover": {
              backgroundColor: "#4F46E5",
            },
          },
        },
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: "#111827",
          border: "1px solid #1F2937",
        },

        option: {
          color: "#D1D5DB",

          "&:hover": {
            backgroundColor: "#1F2937",
          },

          "&[aria-selected='true']": {
            backgroundColor: "rgba(99, 102, 241, 0.15)",
          },
        },

        noOptions: {
          color: "#9CA3AF",
        },

        loading: {
          color: "#9CA3AF",
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#0F172A",
          backgroundImage: "none",
          borderRight: "1px solid #1F2937",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0F172A",
          backgroundImage: "none",
          borderBottom: "1px solid #1F2937",
          boxShadow: "none",
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#1F2937",
        },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: "#1F2937",
        },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: "#6B7280",

          "&.Mui-checked": {
            color: "#6366F1",

            "& + .MuiSwitch-track": {
              backgroundColor: "#6366F1",
              opacity: 0.5,
            },
          },
        },

        track: {
          backgroundColor: "#374151",
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#6B7280",

          "&.Mui-checked": {
            color: "#6366F1",
          },
        },
      },
    },

    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#6B7280",

          "&.Mui-checked": {
            color: "#6366F1",
          },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: "#1F2937",
          borderRadius: 4,
        },

        bar: {
          borderRadius: 4,
        },
      },
    },

    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: "#6366F1",
        },
      },
    },
  },
});

/* =========================
   LIGHT THEME
========================= */

export const lightTheme = createTheme({
  ...common,

  palette: {
    mode: "light",

    primary: {
      main: "#4F46E5",
      light: "#6366F1",
      dark: "#3730A3",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#7C3AED",
      light: "#8B5CF6",
      dark: "#6D28D9",
      contrastText: "#FFFFFF",
    },

    success: {
      main: "#16A34A",
      light: "#22C55E",
      dark: "#15803D",
      contrastText: "#FFFFFF",
    },

    warning: {
      main: "#D97706",
      light: "#F59E0B",
      dark: "#B45309",
      contrastText: "#FFFFFF",
    },

    error: {
      main: "#DC2626",
      light: "#EF4444",
      dark: "#B91C1C",
      contrastText: "#FFFFFF",
    },

    info: {
      main: "#2563EB",
      light: "#3B82F6",
      dark: "#1D4ED8",
      contrastText: "#FFFFFF",
    },

    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#111827",
      secondary: "#6B7280",
      disabled: "#9CA3AF",
    },

    divider: "#E5E7EB",
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor: "#F8FAFC",
        },

        body: {
          margin: 0,
          backgroundColor: "#F8FAFC",
          color: "#111827",
          scrollbarColor: "#CBD5E1 #F8FAFC",
        },

        "*::-webkit-scrollbar": {
          width: 8,
          height: 8,
        },

        "*::-webkit-scrollbar-track": {
          background: "#F1F5F9",
        },

        "*::-webkit-scrollbar-thumb": {
          background: "#CBD5E1",
          borderRadius: 8,
        },

        "*::-webkit-scrollbar-thumb:hover": {
          background: "#94A3B8",
        },

        "::selection": {
          backgroundColor: "#6366F1",
          color: "#FFFFFF",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          backgroundImage: "none",
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 38,
          boxShadow: "none",
        },

        containedPrimary: {
          backgroundColor: "#4F46E5",

          "&:hover": {
            backgroundColor: "#4338CA",
          },
        },

        outlined: {
          borderColor: "#CBD5E1",

          "&:hover": {
            borderColor: "#4F46E5",
            backgroundColor: "rgba(79,70,229,0.05)",
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#64748B",

          "&:hover": {
            color: "#111827",
            backgroundColor: "#F1F5F9",
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderRadius: 8,

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#CBD5E1",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#94A3B8",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#4F46E5",
          },
        },

        input: {
          color: "#111827",

          "&::placeholder": {
            color: "#94A3B8",
            opacity: 1,
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#64748B",

          "&.Mui-focused": {
            color: "#4F46E5",
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        select: {
          backgroundColor: "#FFFFFF",
        },

        icon: {
          color: "#64748B",
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "#374151",

          "&:hover": {
            backgroundColor: "#F1F5F9",
          },

          "&.Mui-selected": {
            backgroundColor: "rgba(79,70,229,0.1)",
            color: "#4F46E5",
          },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#FFFFFF",
          backgroundImage: "none",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: "#111827",
          fontWeight: 600,
          borderBottom: "1px solid #E5E7EB",
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: "#374151",
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: "1px solid #E5E7EB",
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 10,
        },
      },
    },

    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#F8FAFC",
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #E5E7EB",
          color: "#374151",
        },

        head: {
          color: "#64748B",
          fontWeight: 600,
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#F8FAFC",
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },

        colorDefault: {
          backgroundColor: "#F1F5F9",
          color: "#475569",
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#1F2937",
          color: "#FFFFFF",
          fontSize: "0.75rem",
        },

        arrow: {
          color: "#1F2937",
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#FFFFFF",
          backgroundImage: "none",
          borderRight: "1px solid #E5E7EB",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          backgroundImage: "none",
          borderBottom: "1px solid #E5E7EB",
          color: "#111827",
          boxShadow: "none",
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#E5E7EB",
        },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: "#E2E8F0",
        },
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
        },

        option: {
          color: "#374151",

          "&:hover": {
            backgroundColor: "#F1F5F9",
          },

          "&[aria-selected='true']": {
            backgroundColor: "rgba(79,70,229,0.1)",
          },
        },

        noOptions: {
          color: "#64748B",
        },

        loading: {
          color: "#64748B",
        },
      },
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: "#64748B",

          "&:hover": {
            backgroundColor: "#F1F5F9",
          },

          "&.Mui-selected": {
            backgroundColor: "#4F46E5",
            color: "#FFFFFF",

            "&:hover": {
              backgroundColor: "#4338CA",
            },
          },
        },
      },
    },
  },
});

export default darkTheme;