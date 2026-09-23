import { Box, Flex, Text } from "@chakra-ui/react";
import { IPoolAllocation } from "@/api/pools/types";

const SEGMENT_TONES = ["accent", "ink2", "ink3", "lineStrong", "muted"];

const pct = (share: number) => `${Math.round(share * 100)}%`;

/** Stacked allocation bar with a legend (Invictus site pattern). `share` values are fractions. */
export const AllocationBar = ({ allocations }: { allocations: IPoolAllocation[] }) => {
  const sorted = [...allocations].sort((a, b) => b.share - a.share);
  return (
    <Box as="figure" w="100%">
      <Flex h="8px" w="100%" overflow="hidden" bg="bg3" role="img" aria-label="Current allocation">
        {sorted.map((a, i) => (
          <Box key={a.destination} bg={SEGMENT_TONES[i % SEGMENT_TONES.length]} w={pct(a.share)} />
        ))}
      </Flex>
      <Flex as="figcaption" direction="column" gap="6px" mt="12px">
        {sorted.map((a, i) => (
          <Flex key={a.destination} justify="space-between" align="center" gap="12px">
            <Flex align="center" gap="8px" minW={0}>
              <Box flexShrink={0} w="8px" h="8px" bg={SEGMENT_TONES[i % SEGMENT_TONES.length]} />
              <Text fontFamily="mono" fontSize="12px" color="ink2" noOfLines={1}>
                {a.destination}
              </Text>
            </Flex>
            <Text fontFamily="mono" fontSize="12px" color="ink" sx={{ fontVariantNumeric: "tabular-nums" }}>
              {pct(a.share)}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};
