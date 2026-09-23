import { Box, Flex, Grid } from "@chakra-ui/react";
import React from "react";
import { useAccount } from "wagmi";

import { ActionPanel } from "./ActionPanel";
import { Allocations } from "./Allocations";
import { BaseChart } from "./BaseChart";
import EarningsChart from "./EarningsChart";

/**
 * Pool page body: analytics on the left, the deposit/withdraw panel on the right.
 * The panel sticks below the header while the analytics column scrolls; on narrow screens
 * it comes first.
 */
const BaseStrategy: React.FC<any> = ({ pool, chartData }) => {
  const { address } = useAccount();
  return (
    <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 400px" }} gap="24px" alignItems="start">
      <Flex direction="column" minW={0} order={{ base: 2, lg: 1 }}>
        <Flex
          w="100%"
          h={{ base: "400px", md: "440px" }}
          bg="bg2"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="line"
          borderRadius="2px"
          padding="24px"
        >
          <BaseChart chartData={chartData} />
        </Flex>
        <EarningsChart token={pool?.token} address={address} pool={pool} />
        <Allocations pool={pool} />
      </Flex>

      <Box order={{ base: 1, lg: 2 }} position={{ base: "static", lg: "sticky" }} top="88px">
        <ActionPanel pool={pool} />
      </Box>
    </Grid>
  );
};
export default BaseStrategy;
