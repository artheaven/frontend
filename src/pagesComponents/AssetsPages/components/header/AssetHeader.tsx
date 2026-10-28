"use client";
import { Box, Flex, Link, Text } from "@chakra-ui/layout";
import { useMediaQuery } from "@chakra-ui/react";
import React, { FC, useMemo } from "react";

import Icon from "@/components/icon";
import { getFinalExplorerUrl } from "@/utils/url";

import { Risk } from "../../../../components/risk";
import { riskBgColor, riskColor } from "../../../../components/risk/utils";
import { TokenIcon } from "../../../../components/token-icon";
import {
  ARB_DEFAULT_EXPLORER_URL,
  ETH_DEFAULT_EXPLORER_URL,
  BSC_DEFAULT_EXPLORER_URL,
  BASE_DEFAULT_EXPLORER_URL,
  ICON_NAMES,
  MEDIA_QUERY_MAX,
  CHAIN_ICONS
} from "../../../../consts";
import { ROUTES_TYPE } from "../../../../consts/routes-type";
import { getCurrentPath } from "../../../../features/RebalancePerformance/utils";
import { formatNumber } from "../../../../utils/formatNumber";
import { usePathname } from "next/navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "@/hooks/useStoreContext";
import { ICHAIN } from "@/types";
import { arbitrum, base, bsc, mainnet } from "viem/chains";

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

const getChainIdByChainName = (chainName: string) => {
  switch (chainName) {
    case "BSC":
      return bsc.id;
    case "Base":
      return base.id;
    case "Arbitrum":
      return arbitrum.id;
    default:
      return mainnet.id;
  }
};

/** TVL against the vault's maximum size: a thin bar and "70% of $40M cap". */
const Capacity = ({ funds, cap }: { funds: number; cap?: number | null }) => {
  if (!cap) return null;
  const used = Math.min(1, funds / cap);
  return (
    <Flex direction="column" gap="6px" w="140px">
      <Box h="4px" w="100%" bg="bg3" borderRadius="2px" overflow="hidden" role="img" aria-label={`${Math.round(used * 100)}% of the vault cap used`}>
        <Box h="100%" w={`${used * 100}%`} bg="accent" />
      </Box>
      <Text fontFamily="mono" fontSize="11px" color="ink3">
        {Math.round(used * 100)}% of ${formatNumber(cap)} cap
      </Text>
    </Flex>
  );
};

export const AssetHeader: FC<{
  pool: any;
  chainName: ICHAIN;
}> = observer(({ pool, chainName }) => {
  const location = usePathname();
  const pathName = getCurrentPath(location);
  const [media] = useMediaQuery(MEDIA_QUERY_MAX);
  const { activeChain } = useStore("poolsStore");

  const chainIcon = useMemo(() => CHAIN_ICONS[getChainIdByChainName(activeChain)], [activeChain]);

  const getTitle = () => {
    if (chainName === "Base" && pool.token === "USDC") {
      return "Morpho USDC";
    }

    return pool.token;
  };

  if (media) {
    return (
      <Flex w="100%" h="fit-content" flexDirection="column">
        <Flex gap="24px" flexDirection="column" className="step-3">
          <Flex gap="8px" align="inherit">
            <TokenIcon name={pool?.token} size="32px" sizeIcon="22px" />
            <Flex
              direction="row"
              gap="8px"
              alignItems="center"
              w="100%"
              justifyContent="space-between"
            >
              <Flex gap="10px" textStyle="h1" fontWeight="500" lineHeight="24px" align={"center"}>
                <Text>{getTitle()}</Text>
                <Link
                  href={getFinalExplorerUrl({
                    url: getExplorerUrlByChain(chainName),
                    address: pool.tokenAddress,
                    type: "token"
                  })}
                  isExternal
                >
                  <Icon name={ICON_NAMES?.assetFunction} size="sm" />
                </Link>
              </Flex>
              <Text display="flex" flexDirection="row" mt="4px">
                <Flex gap="8px" alignItems="center">
                  <Text textStyle="eyebrow">Pool</Text>
                  <Flex gap="5px">
                    <Icon name={chainIcon} size="18px" />
                    <Text textStyle="text14" color="black.5">
                      {pool.rebalancerAddress?.substring(0, 12) +
                        "..." +
                        pool.rebalancerAddress?.substring(pool.rebalancerAddress?.length - 5)}
                    </Text>
                    <Link
                      href={getFinalExplorerUrl({
                        url: getExplorerUrlByChain(chainName),
                        address: pool.rebalancerAddress,
                        type: "address"
                      })}
                      isExternal
                    >
                      <Icon name={ICON_NAMES.link} size="sm" />
                    </Link>
                  </Flex>
                </Flex>
              </Text>
            </Flex>
          </Flex>

          <Flex flexDirection="column" fontWeight="500">
            <Flex justifyContent="space-between" alignItems="center">
              <Text textStyle="eyebrow">Net APY · 30D</Text>
              <Flex gap={1} alignItems="center">
                <Text textStyle="textMono20" fontSize="22px">{pool.avgApr.toFixed(2)} %</Text>
              </Flex>
            </Flex>
            <Flex justifyContent="space-between" alignItems="center">
              <Text textStyle="eyebrow">TVL</Text>
              <Text textStyle="textMono20" fontSize="22px">$ {formatNumber(pool.funds.toFixed(2))}</Text>
            </Flex>
            {pool.terms?.capUsd ? (
              <Flex justifyContent="flex-end" mt="6px">
                <Capacity funds={pool.funds} cap={pool.terms.capUsd} />
              </Flex>
            ) : null}
            {pool.terms ? (
              <Flex justifyContent="space-between" alignItems="center" mt="6px">
                <Text textStyle="eyebrow">Performance fee</Text>
                <Text textStyle="textMono20" fontSize="18px">{Math.round(pool.terms.performanceFee * 100)} %</Text>
              </Flex>
            ) : null}
          </Flex>
        </Flex>

        {ROUTES_TYPE.lending === pathName && (
          <Flex gap="24px" mt="28px" justifyContent="space-between">
            <Flex direction="column" gap="8px">
              <Text textStyle="eyebrow">Risk factor</Text>
              <Text
                p="0 10px"
                bg={riskBgColor[pool.risk]}
                w="fit-content"
                fontSize="xl"
                fontWeight="500"
                color={riskColor[pool.risk]}
                borderRadius="10px"
              >
                {pool.risk}/5
              </Text>
            </Flex>
            <Risk risk={pool.risk} w="12px" h="50px" gap="12px" />

            <Flex direction="column" gap="8px" color="ink2" justify="center" lineHeight="14px">
              <Text textStyle="text12">Asset risk - {pool?.risk}</Text>
              <Text textStyle="text12">Protocols risk - {pool?.risk}</Text>
            </Flex>
          </Flex>
        )}
      </Flex>
    );
  }

  return (
    <Flex w="100%" h="fit-content" align="flex-start" justify="space-between">
      <Flex align="flex-start" gap="48px" flexDirection={media ? "column" : "row"} className="step-3">
        <Flex gap="8px" align="inherit">
          <TokenIcon name={pool?.token} />
          <Flex direction="column" gap="8px">
            <Text textStyle="eyebrow">
              {getTitle()} · {chainName}
            </Text>
            <Flex gap="12px" align="center">
              <Flex align="center" gap="10px">
                <Text textStyle="h1">{pool?.token}</Text>
              </Flex>
              <Link
                href={getFinalExplorerUrl({
                  url: getExplorerUrlByChain(chainName),
                  address: pool.tokenAddress,
                  type: "token"
                })}
                isExternal
              >
                <Icon name={ICON_NAMES.assetFunction} size="sm" />
              </Link>
            </Flex>
          </Flex>
        </Flex>

        <Flex direction="column" gap="8px">
          <Text textStyle="eyebrow">Net APY · 30D</Text>
          <Flex gap={1} alignItems="center">
            <Text textStyle="textMono20" fontSize="22px">{pool?.avgApr?.toFixed(2)} %</Text>
          </Flex>
          {pool?.apr > 0 ? (
            <Text fontFamily="mono" fontSize="11px" color="pos">
              +{pool.apr.toFixed(2)} pp vs best market
            </Text>
          ) : null}
        </Flex>

        <Flex direction="column" gap="8px">
          <Text textStyle="eyebrow">TVL</Text>
          <Text textStyle="textMono20" fontSize="22px">$ {formatNumber(pool?.funds?.toFixed(2))}</Text>
          <Capacity funds={pool?.funds} cap={pool?.terms?.capUsd} />
        </Flex>

        {pool?.terms ? (
          <Flex direction="column" gap="8px">
            <Text textStyle="eyebrow">Performance fee</Text>
            <Text textStyle="textMono20" fontSize="22px">{Math.round(pool.terms.performanceFee * 100)} %</Text>
            <Text fontFamily="mono" fontSize="11px" color="ink3">
              of yield · no other fees
            </Text>
          </Flex>
        ) : null}
      </Flex>

      {ROUTES_TYPE.lending === pathName && (
        <Flex p="16px 24px" gap="24px" border="1px solid" borderColor="line" borderRadius="10px">
          <Flex direction="column" gap="8px">
            <Text textStyle="eyebrow">Risk factor</Text>
            <Text
              p="0 10px"
              bg={riskBgColor[pool?.risk]}
              w="fit-content"
              fontSize="xl"
              fontWeight="500"
              color={riskColor[pool?.risk]}
              borderRadius="10px"
            >
              {pool?.risk}/5
            </Text>
          </Flex>
          <Risk risk={pool?.risk} w="12px" h="50px" gap="12px" />

          <Flex direction="column" gap="8px" color="ink2" justify="center">
            <Text textStyle="text12">Asset risk - {pool?.risk}</Text>
            <Text textStyle="text12">Protocols risk - {pool?.risk}</Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
});
