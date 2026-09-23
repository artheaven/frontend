import { Text, TextProps } from "@chakra-ui/react";

type Kind = "DEMO DATA" | "DEMO" | "LIVE" | "PAUSED";

const tone: Record<Kind, TextProps> = {
  "DEMO DATA": { color: "accent", borderColor: "accentAlpha.60", bg: "accentTint" },
  DEMO: { color: "accent", borderColor: "accentAlpha.60", bg: "accentTint" },
  LIVE: { color: "pos", borderColor: "posAlpha.60" },
  PAUSED: { color: "neg", borderColor: "negAlpha.60" }
};

/** Mono status pill, same as the Invictus site. */
export const StatusPill = ({ kind, ...rest }: { kind: Kind } & TextProps) => (
  <Text
    as="span"
    display="inline-flex"
    alignItems="center"
    whiteSpace="nowrap"
    borderWidth="1px"
    borderStyle="solid"
    borderRadius="1px"
    px="6px"
    py="3px"
    fontFamily="mono"
    fontSize="10px"
    lineHeight="1"
    letterSpacing="0.14em"
    textTransform="uppercase"
    {...tone[kind]}
    {...rest}
  >
    {kind}
  </Text>
);
