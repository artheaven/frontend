import { Text, TextProps } from "@chakra-ui/react";

// Text wordmark, same treatment as the Invictus site (logo mark is still TBD there).
export const Wordmark = (props: TextProps) => (
  <Text
    as="span"
    fontFamily="mono"
    fontSize="sm"
    letterSpacing={{ base: "0.22em", md: "0.32em" }}
    color="ink"
    whiteSpace="nowrap"
    {...props}
  >
    INVICTUS
  </Text>
);
