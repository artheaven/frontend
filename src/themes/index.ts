import { extendTheme } from "@chakra-ui/react";

import { Button } from "./components/Button";
import { cardTheme } from "./components/Card";
import { drawerTheme } from "./components/Drawer";
import { inputTheme } from "./components/Input";
import { Link } from "./components/Link";
import { modalTheme } from "./components/Modal";
import { skeletonTheme } from "./components/Skeleton";
import { switchTheme } from "./components/Switch";
import { Text } from "./components/Text";
import { tooltipTheme } from "./components/Tooltip";
import { fonts } from "./fonts";
import { colors } from "./styles/colors";
import { fontSizes } from "./styles/fontSize";
import { global } from "./styles/global";
import { textStyles } from "./styles/textStyles";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false
};

export const themes = extendTheme({
  config,
  fonts: {
    heading: fonts.display,
    body: fonts.sans,
    mono: fonts.mono
  },
  styles: { global: { ...global } },
  colors: { ...colors },
  radii: {
    sm: "1px",
    base: "2px",
    md: "2px",
    lg: "2px",
    xl: "2px",
    "2xl": "2px"
  },
  shadows: {
    outline: "0 0 0 2px var(--chakra-colors-accent)"
  },
  textStyles: {
    ...textStyles
  },
  fontSizes: { ...fontSizes },
  components: {
    Text,
    Button,
    Link,
    Card: cardTheme,
    Switch: switchTheme,
    Drawer: drawerTheme,
    Input: inputTheme,
    Modal: modalTheme,
    Tooltip: tooltipTheme,
    Skeleton: skeletonTheme
  },
  breakpoints: {
    sm: "400px",
    md: "700px",
    lg: "960px",
    xl: "1300px",
    xxl: "1400px"
  }
});
