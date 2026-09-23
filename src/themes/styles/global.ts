export const global = {
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
  "@media (prefers-reduced-motion: reduce)": {
    "*, *::before, *::after": {
      animationDuration: "0.01ms !important",
      animationIterationCount: "1 !important",
      transitionDuration: "0.01ms !important"
    }
  }
};
