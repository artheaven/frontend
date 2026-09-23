"use client";
import { IconButton, useColorMode } from "@chakra-ui/react";

/** Dark/light switch, same glyph as the Invictus site. Chakra persists the choice. */
export const ThemeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const next = colorMode === "dark" ? "light" : "dark";
  return (
    <IconButton
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      onClick={toggleColorMode}
      variant="secondaryOutline"
      minW="32px"
      w="32px"
      h="32px"
      p="0"
      color="ink2"
      _hover={{ color: "ink", borderColor: "accent" }}
      icon={
        <svg aria-hidden viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.25">
          <circle cx="8" cy="8" r="5.5" />
          <path d="M8 2.5v11" />
          <path d="M8 2.5a5.5 5.5 0 0 1 0 11z" fill="currentColor" />
        </svg>
      }
    />
  );
};
