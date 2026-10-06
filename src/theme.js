import { createTheme } from '@mui/material/styles'

/**
 * Central design tokens. Change a value here and it updates everywhere,
 * since every component reads color/spacing from the MUI theme rather
 * than hardcoding values.
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0c7c72', // deep teal
      light: '#3d9a91',
      dark: '#08544e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#21201c', // warm ink, used for the "secondary" solid button
      contrastText: '#ffffff',
    },
    error: {
      main: '#c4432b', // warm rust red, not the default MUI red
      light: '#fbeae5',
      dark: '#a83722',
    },
    warning: {
      main: '#b9791a',
      light: '#fbf0de',
      dark: '#9a6414',
    },
    success: {
      main: '#2f7a4d',
      light: '#e7f4ec',
      dark: '#256440',
    },
    background: {
      default: '#f7f7f5', // canvas
      paper: '#ffffff', // surface
    },
    text: {
      primary: '#21201c',
      secondary: '#6b6a63',
      disabled: '#9a988f',
    },
    divider: '#e3e1dc',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", ui-sans-serif, system-ui, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12 },
      },
    },
  },
})

export default theme
