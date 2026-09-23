import { switchAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  switchAnatomy.keys
);

const baseStyle = definePartsStyle({
  thumb: { bg: "ink" },
  track: {
    bg: "lineStrong",
    borderRadius: "2px",
    _checked: { bg: "accent" }
  }
});

export const switchTheme = defineMultiStyleConfig({ baseStyle });
