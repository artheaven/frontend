"use client";

import { Divider, Flex, HStack, Link, Text, useMediaQuery, Box, Skeleton } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useParams, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import Icon from "../../components/icon";
import {
  ARB_DEFAULT_EXPLORER_URL,
  ETH_DEFAULT_EXPLORER_URL,
  BSC_DEFAULT_EXPLORER_URL,
  BASE_DEFAULT_EXPLORER_URL,
  CHAIN_ICONS,
  ICON_NAMES,
  MEDIA_QUERY_MAX
} from "../../consts";
import { STRATEGIES } from "../../consts/strategies";
import BaseStrategy from "../../features/RebalanceStrategy/BaseStrategy";
import { getFinalExplorerUrl } from "../../utils/url";
import { AssetHeader } from "./components/header/AssetHeader";
import { IPoolData, IAreaChartData } from "@/api/pools/types";
import { useAnalyticsEventTracker } from "@/hooks/useAnalyticsEventTracker";
import { useEffect } from "react";
import { getIdByToken } from "@/utils/analytics";
import { ICHAIN } from "@/types";

// Helper function to get the explorer URL based on chain name
const getExplorerUrlByChain = (chainName: string): string => {
  switch (chainName) {
    case "BSC":
      return BSC_DEFAULT_EXPLORER_URL;
    case "Base":
      return BASE_DEFAULT_EXPLORER_URL;
    case "Arbitrum":
      return ARB_DEFAULT_EXPLORER_URL;
    default:
      return ETH_DEFAULT_EXPLORER_URL;
  }
};

export const LendingAsset = observer(
  ({
    pool,
    chartData,
    loading,
    error,
    isChartLoading,
    poolChainId,
    chainName
  }: {
    pool: IPoolData | null;
    chartData: IAreaChartData | null;
    loading: boolean;
    isChartLoading: boolean;
    error: string | null;
    poolChainId: number;
    chainName: ICHAIN;
  }) => {
    const { chain } = useAccount();
    const { poolToken } = useParams();
    const searchParams = useSearchParams();
    const strategic = searchParams.get("strategic") ?? STRATEGIES.based;
    const event = useAnalyticsEventTracker();

    useEffect(() => {
      if (pool) {
        event({
          action: `Click_page_${getIdByToken(pool.token)}`,
          label: `Click page "${getIdByToken(pool.token)}"`
        });
      }
    }, [pool]);

    const [media] = useMediaQuery(MEDIA_QUERY_MAX);

    const renderSkeleton = (height: string, width?: string) => (
      <Skeleton height={height} width={width || "100%"} />
    );

    return (
      <Flex h="100%" w="100%" direction="column" gap="24px">
        {loading || error || pool === null ? (
          <>
            {renderSkeleton("40px")}
            {renderSkeleton("20px", "150px")}
            {renderSkeleton("20px", "100px")}
          </>
        ) : (
          <AssetHeader pool={pool} chainName={chainName} />
        )}
        <Flex direction="column">
          <Flex align="center" justify="space-between">
            {!media && (
              <Flex gap="8px" alignItems="center">
                {/* A skeleton is a <div>; it must not sit inside <Text> (<p>), or SSR and hydration disagree. */}
                {loading || error ? renderSkeleton("20px", "60px") : <Text fontWeight="500">Pool</Text>}
                <Flex align="center" gap="5px">
                  {loading || error ? (
                    <>
                      {renderSkeleton("18px", "18px")}
                      {renderSkeleton("20px", "100px")}
                    </>
                  ) : (
                    <>
                      <Icon name={CHAIN_ICONS[poolChainId]} size="18px" />
                      <Link
                        href={getFinalExplorerUrl({
                          url: getExplorerUrlByChain(chainName),
                          address: pool?.rebalancerAddress,
                          type: "address"
                        })}
                        display="flex"
                        justifyContent={"space-between"}
                        isExternal
                      >
                        <Text textStyle="text14" color="black.5" mr="6px">
                          {pool?.rebalancerAddress}
                        </Text>
                        <Icon name={ICON_NAMES.link} size="sm" />
                      </Link>
                    </>
                  )}
                </Flex>
              </Flex>
            )}

            <HStack divider={<Divider orientation="vertical" />} h="100%" color="black.5">
              {loading || error ? (
                renderSkeleton("20px", "100px")
              ) : (
                <Link
                  href="https://rebalance.gitbook.io/rebalance/yield-optimization-and-lp/lending-rebalance-strategy#mechanism-behind-the-rebalancer"
                  isExternal
                >
                  <Flex align="center" gap="8px">
                    How the strategy works <Icon name={ICON_NAMES.link} size="18px" />
                  </Flex>
                </Link>
              )}
            </HStack>
          </Flex>
        </Flex>
        <Flex direction="column">
          {strategic === STRATEGIES.based ? (
            isChartLoading || error ? (
              renderSkeleton("200px")
            ) : (
              <BaseStrategy pool={pool} chartData={chartData} isLoadingChart={isChartLoading} />
            )
          ) : null}
        </Flex>
      </Flex>
    );
  }
);
