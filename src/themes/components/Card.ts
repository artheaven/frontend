import { cardAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  cardAnatomy.keys
);

const baseStyle = definePartsStyle({
  container: {
    color: "ink",
    boxShadow: "none"
  }
});

const sizes = {
  md: definePartsStyle({
    container: { borderRadius: "0" }
  }),
  xl: definePartsStyle({
    container: { borderRadius: "2px", padding: "40px" }
  })
};

const variants = {
  poolCard: definePartsStyle({
    container: {
      w: { base: "100%" },
      minH: "302px",
      padding: "20px",
      gap: "20px",
      bg: "bg2",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "line",
      borderRadius: "2px",
      transition: "border-color 120ms",
      _hover: { borderColor: "lineStrong" }
    },
    header: { padding: "0" },
    body: { padding: "0" },
    footer: { padding: "0" }
  })
};

export const cardTheme = defineMultiStyleConfig({
  baseStyle,
  sizes,
  variants,
  defaultProps: {}
});
