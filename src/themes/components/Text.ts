import { defineStyleConfig } from "@chakra-ui/react";

export const Text = defineStyleConfig({
  baseStyle: {},
  sizes: {},
  variants: {
    tooltip: {
      cursor: "help",
      textDecoration: "underline",
      textDecorationStyle: "dashed",
      textDecorationColor: "lineStrong",
      textUnderlineOffset: "3px",
      color: "ink3"
    },
    t22: { fontSize: "xl", fontWeight: 400 },
    t20: { fontSize: "lg", fontWeight: 400 }
  },
  defaultProps: {}
});
