"use client";
import { Flex, SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

import { IPoolData } from "@/api/pools/types";
import { AllocationBar } from "@/components/allocation-bar";
import { Risk } from "@/components/risk";
import { TokenIcon } from "@/components/token-icon";
import { Tooltip } from "@/components/tooltip";
import { DepositLendingButton } from "@/features/actions/deposit-or-withdraw-button/DepositLendingButton";
import { WithdrawLendingButton } from "@/features/actions/deposit-or-withdraw-button/WithdrawLendingButton";
import { getIdByToken } from "@/utils/analytics";
import { formatNumber } from "@/utils/formatNumber";
import DepositInfo from "./DepositInfo";
import UserProfitPool from "./UserProfitPool";

const Metric = ({
  label,
  value,
  sub,
  tooltip,
  loading
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  tooltip?: ReactNode;
  loading?: boolean;
}) => (
  <Flex direction="column" gap="8px" minW={0}>
    {tooltip ? (
      <Tooltip label={tooltip}>
        <Text
          textStyle="eyebrow"
          w="fit-content"
          cursor="help"
          borderBottom="1px dashed"
          borderColor="lineStrong"
        >
          {label}
        </Text>
      </Tooltip>
    ) : (
      <Text textStyle="eyebrow">{label}</Text>
    )}
    {loading ? (
      <Skeleton h="28px" w="80px" />
    ) : (
      <Text fontFamily="mono" fontSize="26px" lineHeight="1.1" color="ink" sx={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
    )}
    {sub ? (
      <Text fontFamily="mono" fontSize="12px" color="ink3">
        {sub}
      </Text>
    ) : null}
  </Flex>
);

interface VaultCardProps {
  pool: IPoolData;
  chainName: string;
  address?: `0x${string}`;
  loading?: boolean;
  strategyTooltip?: ReactNode;
  onOpen: (event: React.MouseEvent) => void;
}

/** Vault card in the Invictus site layout: name, two metrics, allocation, position, actions. */
export const VaultCard = ({
  pool,
  chainName,
  address,
  loading,
  strategyTooltip,
  onOpen
}: VaultCardProps) => {
  const delta = pool.apr;

  return (
    <Flex
      id={`Click_page_${getIdByToken(pool.token)}`}
      direction="column"
      gap="24px"
      h="100%"
      p={{ base: "20px", md: "28px" }}
      bg="bg2"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="line"
      borderRadius="2px"
      cursor="pointer"
      transition="border-color 120ms"
      _hover={{ borderColor: "lineStrong" }}
      onClick={onOpen}
    >
      {/* Header */}
      <Flex justify="space-between" align="flex-start" gap="12px">
        <Flex align="center" gap="12px" minW={0}>
          <TokenIcon name={pool.token} size="40px" sizeIcon="22px" />
          <Flex direction="column" gap="4px" minW={0}>
            <Text fontSize="22px" lineHeight="1.15" color="ink" noOfLines={1}>
              {pool.token}
            </Text>
            <Text fontFamily="mono" fontSize="13px" color="ink3">
              {pool.token} · {chainName}
            </Text>
          </Flex>
        </Flex>
        <Tooltip label="Asset and protocol risk, 1 (lowest) to 5">
          <Flex direction="column" align="flex-end" gap="6px">
            <Text textStyle="eyebrow">Risk</Text>
            <Risk risk={pool.risk} w="3px" h="16px" gap="3px" />
          </Flex>
        </Tooltip>
      </Flex>

      {/* Metrics */}
      <SimpleGrid columns={2} spacing="16px">
        <Metric
          label="30D avg APY"
          value={`${(pool.avgApr ?? 0).toFixed(2)}%`}
          tooltip={strategyTooltip}
          loading={loading}
          sub={
            <Tooltip label="Advantage over the highest lending market APY in the last 30 days">
              <Text as="span" color={delta > 0 ? "pos" : "ink3"}>
                {delta > 0 ? "+" : ""}
                {delta.toFixed(2)} pp vs market
              </Text>
            </Tooltip>
          }
        />
        <Metric label="Funds in pool" value={`$${formatNumber(pool.funds)}`} loading={loading} />
      </SimpleGrid>

      {/* Allocation */}
      {pool.allocations?.length ? <AllocationBar allocations={pool.allocations} /> : null}

      {/* Position */}
      {address ? (
        <SimpleGrid columns={2} spacing="16px" pt="16px" borderTop="1px solid" borderColor="line">
          <Flex direction="column" gap="6px">
            <Text textStyle="eyebrow">My deposit</Text>
            <DepositInfo
              contractAddress={pool.rebalancerAddress as `0x${string}`}
              ownerAddress={address}
              tokenName={pool.token}
              decimals={pool.decimals}
              noTitle
              TextProps={{ fontSize: "15px", color: "ink" }}
            />
          </Flex>
          <Flex direction="column" gap="6px">
            <Text textStyle="eyebrow">My profit</Text>
            <Text textStyle="textMono14" fontSize="15px">
              <UserProfitPool address={address} token={pool.token} />
            </Text>
          </Flex>
        </SimpleGrid>
      ) : null}

      {/* Actions — pinned to the bottom so buttons line up across cards in a row */}
      <Flex gap="8px" mt="auto">
        <DepositLendingButton
          pool={pool}
          minHeight="40px"
          id={address ? `Click_Deposit_${getIdByToken(pool.token)}` : `Click_Deposit_start_${getIdByToken(pool.token)}`}
        />
        <WithdrawLendingButton pool={pool} minHeight="40px" />
      </Flex>
    </Flex>
  );
};
