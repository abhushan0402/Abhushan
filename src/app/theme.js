import { alpha, createTheme } from "@mui/material/styles";

// Same brand palette as the customer-facing website (Abhushan Frontend/src/theme/tokens.js).
// primary[400/500/700/900] are the site's exact accentLight/accent/accentDark/black stops -
// the other shades are interpolated tints/shades around them.
const primary = {
  50: "#f5edf7",
  100: "#e9d8ee",
  200: "#d5b5de",
  300: "#bc87c9",
  400: "#9C4FB0",
  500: "#701888",
  600: "#611578",
  700: "#4F1164",
  800: "#3d0d50",
  900: "#2e0a3f",
};

// Site's exact gold tokens: goldLight/gold/goldDark.
const gold = { 300: "#FDE047", 400: "#F5D033", 500: "#facc15", 600: "#CA8A04", 700: "#A16B03" };

const textOnLight = "#211d17";
const textOnLightMuted = "#6f6a5f";
const borderOnLight = "rgba(33, 29, 23, 0.12)";
const cream = "#f8f5ef";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { ...primary, main: primary[500], light: primary[300], dark: primary[700], contrastText: "#FFFFFF" },
    secondary: { main: primary[900], light: primary[700], dark: "#1b1338", contrastText: "#f5f1e8" },
    accentGold: { main: gold[500], light: gold[300], dark: gold[600], contrastText: textOnLight },
    success: { main: "#22C55E" },
    warning: { main: gold[600] },
    error: { main: "#b3453f" },
    info: { main: "#4C7CE0" },
    background: { default: cream, paper: "#FFFFFF" },
    text: { primary: textOnLight, secondary: textOnLightMuted },
    divider: borderOnLight,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: `"DM Sans","Inter","Roboto","Helvetica","Arial",sans-serif`,
    h1: { fontFamily: `"Lora","Georgia",serif`, fontWeight: 500 },
    h2: { fontFamily: `"Lora","Georgia",serif`, fontWeight: 500 },
    h3: { fontFamily: `"Lora","Georgia",serif`, fontWeight: 500 },
    h4: { fontFamily: `"Lora","Georgia",serif`, fontWeight: 500 },
    h5: { fontFamily: `"Lora","Georgia",serif`, fontWeight: 600 },
    h6: { fontFamily: `"Lora","Georgia",serif`, fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { scrollBehavior: "smooth" },
        "::selection": { backgroundColor: alpha(primary[500], 0.2), color: primary[900] },
      },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 12 } } },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, border: `1px solid ${alpha(primary[500], 0.1)}`, backgroundImage: "none" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10 },
        containedPrimary: {
          backgroundColor: primary[500],
          "&:hover": { backgroundColor: primary[700] },
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, color: textOnLightMuted, backgroundColor: alpha(primary[500], 0.04) },
        root: { borderBottom: `1px solid ${alpha(primary[500], 0.08)}` },
      },
    },
    MuiDrawer: { styleOverrides: { paper: { borderRight: `1px solid ${alpha(primary[500], 0.1)}` } } },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiFormControl: { defaultProps: { size: "small" } },
    MuiSkeleton: { styleOverrides: { root: { backgroundColor: alpha(primary[500], 0.11) } } },
  },
});

export const colors = { primary, gold };
