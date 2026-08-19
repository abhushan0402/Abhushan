import { alpha, createTheme } from "@mui/material/styles";

const roseGold = {
  50: "#FDF4F1",
  100: "#FBE8E2",
  200: "#F3D0C6",
  300: "#E6AFA0",
  400: "#D28E7A",
  500: "#B76E5C",
  600: "#9A5647",
  700: "#7C4238",
  800: "#5E312A",
  900: "#40211C",
};

const gold = {
  300: "#EFC98A",
  400: "#E3B15E",
  500: "#D8A657",
  600: "#BD8A3E",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      ...roseGold,
      main: roseGold[500],
      light: roseGold[300],
      dark: roseGold[700],
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#241F1E",
      light: "#4A413F",
      dark: "#141110",
      contrastText: "#FFFFFF",
    },
    accentGold: {
      main: gold[500],
      light: gold[300],
      dark: gold[600],
      contrastText: "#241F1E",
    },
    success: { main: "#2E9E6B" },
    warning: { main: "#DDA111" },
    error: { main: "#D8453B" },
    info: { main: "#4C7CE0" },
    background: {
      default: "#FBF2EF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#241F1E",
      secondary: "#7A716F",
    },
    divider: alpha(roseGold[500], 0.12),
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: `"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#FBF2EF",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${alpha(roseGold[500], 0.1)}`,
          boxShadow: "0 1px 2px rgba(36, 31, 30, 0.04)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
        },
        containedPrimary: {
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: "#7A716F",
          textTransform: "uppercase",
          fontSize: "0.7rem",
          letterSpacing: "0.04em",
          backgroundColor: "#FCF7F5",
          borderBottom: "none",
        },
        root: {
          borderBottom: `1px solid ${alpha(roseGold[500], 0.08)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${alpha(roseGold[500], 0.1)}`,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: "small",
      },
    },
  },
});

export const colors = { roseGold, gold };
