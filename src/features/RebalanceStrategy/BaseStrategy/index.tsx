import { Box, Flex, SimpleGrid, Text, useMediaQuery } from "@chakra-ui/react";
import React from "react";
import { useAccount } from "wagmi";

import { MEDIA_QUERY_MAX } from "../../../consts";
import { useBalanceOfAsset } from "../../../hooks/useBalanceOfAsset";
import { DepositLendingButton } from "../../actions/deposit-or-withdraw-button/DepositLendingButton";
import { WithdrawLendingButton } from "../../actions/deposit-or-withdraw-button/WithdrawLendingButton";
import { BaseChart } from "./BaseChart";
import EarningsChart from "./EarningsChart";
import { formatNumber } from "@/utils/formatNumber";

const BaseStrategy: React.FC<any> = ({ pool, chartData }) => {
  const { address } = useAccount();
  const { balance } = useBalanceOfAsset(pool.rebalancerAddress, address ?? "0x", pool.decimals);
  const [media] = useMediaQuery(MEDIA_QUERY_MAX);
  return (
    <SimpleGrid columns={media ? 1 : 2} gap="24px">
      <Flex direction="column">
        <Flex direction="column" bg="bg2" borderWidth="1px" borderStyle="solid" borderColor="line" borderRadius="2px" padding="24px">
          <Text textStyle="h2">My deposit</Text>
          <Box mt="16px" mb="24px" display="flex" flexDirection="row" alignItems="baseline">
            <Text textStyle="textMono20" fontSize="24px" lineHeight="24px">
              {formatNumber(balance.toFixed(2))} {pool?.token}
            </Text>
            <Text textStyle="text14" color="ink3" ml="16px">
              {formatNumber(balance.toFixed(2))} $
            </Text>
          </Box>
          <SimpleGrid columns={!media || balance > 0 ? 2 : 1} gap="8px">
            <DepositLendingButton
              variant="primaryWhite"
              pool={pool}
              minHeight="40px"
              className="step-4"
            />
            {balance > 0 && <WithdrawLendingButton pool={pool} minHeight="40px" />}
          </SimpleGrid>
        </Flex>

        <EarningsChart token={pool?.token} address={address} pool={pool} />
      </Flex>

      <Flex w="100%" bg="bg2" borderWidth="1px" borderStyle="solid" borderColor="line" borderRadius="2px" minH="319px" padding="24px">
        <BaseChart chartData={chartData} />
      </Flex>
    </SimpleGrid>
  );
};
export default BaseStrategy;
