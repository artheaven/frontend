import { drawerAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  drawerAnatomy.keys
);

const baseStyle = definePartsStyle({
  overlay: {
    backdropFilter: "auto",
    backdropBlur: "5px"
  }
});

const variants = {
  drawerBlack: definePartsStyle({
    dialog: {
      bg: "bg",
      borderLeft: "1px solid",
      borderColor: "line",
      boxShadow: "none"
    },
    header: { fontWeight: "400" }
  })
};

const sizes = {
  customSm: definePartsStyle({
    dialog: { maxW: { base: "100%", md: "348px" } }
  })
};

export const drawerTheme = defineMultiStyleConfig({
  baseStyle,
  variants,
  sizes,
  defaultProps: {
    variant: "drawerBlack",
    size: "customSm"
  }
});
