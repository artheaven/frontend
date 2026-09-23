import { Box } from "@chakra-ui/react";

/** Geometric transaction status mark (Invictus style: hairline circle + glyph). */
export const StatusMark = ({ kind }: { kind: "success" | "error" }) => {
  const color = kind === "success" ? "accent" : "neg";
  return (
    <Box as="span" color={color} display="inline-flex" aria-hidden>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="32" cy="32" r="30" />
        {kind === "success" ? <path d="M20 33l8 8 16-18" /> : <path d="M23 23l18 18M41 23L23 41" />}
      </svg>
    </Box>
  );
};
