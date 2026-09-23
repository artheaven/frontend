import { themeCssVariables } from "./colors";

export const global = {
  // Dark by default; Chakra sets data-theme on <html> when the colour mode changes.
  ":root": themeCssVariables("dark"),
  ":root[data-theme='light']": themeCssVariables("light"),
  "html, body": {
    bg: "bg",
    color: "ink",
    fontSize: "md",
    WebkitFontSmoothing: "antialiased"
  },
  "::selection": {
    bg: "accentTint",
    color: "ink"
  },
  ":focus-visible": {
    outline: "2px solid",
    outlineColor: "accent",
    outlineOffset: "2px"
  },
  // Monochrome light icons are drawn for dark backgrounds; invert them in light mode.
  ":root[data-theme='light'] img[data-mono-icon]": {
    filter: "invert(1) brightness(0.9)"
  },
  "@media (prefers-reduced-motion: reduce)": {
    "*, *::before, *::after": {
      animationDuration: "0.01ms !important",
      animationIterationCount: "1 !important",
      transitionDuration: "0.01ms !important"
    }
  }
};
