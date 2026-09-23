import { inputAnatomy as parts } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);

// default base style from the Input theme
const baseStyle = definePartsStyle({
  field: {
    width: "100%",
    minWidth: 0,
    outline: 0,
    position: "relative",
    appearance: "none",
    transitionProperty: "common",
    transitionDuration: "normal",
    _disabled: {
      opacity: 0.4,
      cursor: "not-allowed"
    }
  }
});

// Defining a custom variant
const variantCustom = definePartsStyle({
  field: {
    border: "0px solid",
    bg: "transparent",
    fontVariantNumeric: "tabular-nums",
    _placeholder: { color: "ink3" },
    borderTopRightRadius: "full",
    borderBottomRightRadius: "full",
    _readOnly: {
      boxShadow: "none !important",
      userSelect: "all"
    }
  },
  addon: {
    border: "0px solid",
    borderColor: "transparent",
    borderTopLeftRadius: "full",
    borderBottomLeftRadius: "full",
    bg: "transparent",
    color: "ink"
  },
  group: {
    borderWidth: "1px",
      borderStyle: "solid",
    borderColor: "lineStrong",
    borderRadius: "2px",
    bg: "bg",
    alignItems: "center",
    transition: "border-color 120ms",
    _focusWithin: {
      borderColor: "accent"
    },
    _valid: {
      borderColor: "red"
    }
  },
});

const variants = {
  custom: variantCustom
};

export const inputTheme = defineMultiStyleConfig({
  baseStyle,
  variants,
  defaultProps: {
    variant: "custom"
  }
});
