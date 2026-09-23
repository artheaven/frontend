import { defineStyleConfig } from "@chakra-ui/react";

export const Link = defineStyleConfig({
  baseStyle: {
    textDecoration: "none",
    transition: "color 120ms",
    _hover: { textDecoration: "none" }
  },
  sizes: {},
  variants: {
    link: {
      color: "ink2",
      fontSize: "sm",
      _hover: { color: "ink", textDecoration: "none" }
    },
    nav: {
      display: "flex",
      alignItems: "center",
      color: "ink3",
      fontSize: "sm",
      fontWeight: "400",
      _hover: { color: "ink", textDecoration: "none" },
      _activeLink: { color: "ink" }
    }
  },
  defaultProps: {}
});
