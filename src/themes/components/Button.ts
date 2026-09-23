import { defineStyleConfig } from "@chakra-ui/react";
import { fonts } from "../fonts";

// Site-style action: mono, uppercase, tracked, square corners.
const action = {
  fontFamily: fonts.mono,
  fontWeight: "400",
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  fontSize: "xs",
  borderRadius: "2px",
  transition: "background-color 120ms, border-color 120ms, color 120ms, opacity 120ms"
};

export const Button = defineStyleConfig({
  baseStyle: {
    borderRadius: "2px",
    color: "ink"
  },
  sizes: {
    sm: { fontSize: "sm", fontWeight: "500" },
    md: { fontSize: "md", fontWeight: "500" }
  },
  variants: {
    // Secondary action: hairline border, accent on hover.
    primaryFilled: {
      ...action,
      bg: "bg3",
      color: "ink",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "lineStrong",
      _hover: {
        borderColor: "accent",
        color: "accent",
        _disabled: { color: "ink3", bg: "bg2", borderColor: "line" }
      },
      _disabled: { bg: "bg2", color: "ink3", borderColor: "line", opacity: 1 }
    },
    // Primary action: aurum fill.
    primaryWhite: {
      ...action,
      border: "none",
      bg: "accent",
      color: "bg",
      _hover: {
        opacity: 0.9,
        _disabled: { bg: "bg3", color: "ink3", opacity: 1 }
      },
      _disabled: { bg: "bg3", color: "ink3", opacity: 1 }
    },
    outline: {
      ...action,
      color: "ink",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "lineStrong",
      bg: "transparent",
      _hover: { borderColor: "accent", bg: "transparent" },
      _active: { bg: "bg3" },
      _disabled: { bg: "bg2", color: "ink3" }
    },
    secondaryOutline: {
      ...action,
      padding: "4px 12px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "lineStrong",
      color: "ink",
      _hover: { borderColor: "accent" }
    },
    without: {
      p: "0",
      w: "fit-content",
      bg: "transparent"
    }
  },
  defaultProps: {
    variant: "without"
  }
});
