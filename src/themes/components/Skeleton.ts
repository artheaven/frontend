import { defineStyleConfig } from "@chakra-ui/react";

export const skeletonTheme = defineStyleConfig({
  baseStyle: {
    borderRadius: "2px",
    "--skeleton-start-color": "var(--chakra-colors-bg3)",
    "--skeleton-end-color": "var(--chakra-colors-lineStrong)"
  }
});
