import { modalAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  modalAnatomy.keys
);

export const modalTheme = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    overlay: { bg: "rgba(10, 11, 13, 0.6)" },
    dialog: {
      bg: "bg2",
      color: "ink",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "line",
      borderRadius: "2px",
      boxShadow: "none"
    },
    closeButton: { color: "ink3", borderRadius: "2px", _hover: { color: "ink", bg: "bg3" } }
  })
});
