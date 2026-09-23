import { defineStyleConfig } from "@chakra-ui/react";

export const tooltipTheme = defineStyleConfig({
  baseStyle: {
    bg: "bg3",
    color: "ink2",
    borderWidth: "1px",
      borderStyle: "solid",
    borderColor: "lineStrong",
    borderRadius: "2px",
    boxShadow: "none",
    fontSize: "xs",
    px: "10px",
    py: "8px",
    "--popper-arrow-bg": "var(--chakra-colors-bg3)"
  }
});
