"use client";
import { Flex, Link, Text } from "@chakra-ui/layout";
import { useMediaQuery } from "@chakra-ui/react";
import React, { FC, useMemo } from "react";

import Icon from "@/components/icon";
import { getFinalExplorerUrl } from "@/utils/url";

import { Risk } from "../../../../components/risk";
import { riskBgColor, riskColor } from "../../../../components/risk/utils";
import { TokenIcon } from "../../../../components/token-icon";
import {
  ARB_DEFAULT_EXPLORER_URL,
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
import { arbitrum, base, bsc } from "viem/chains";

const getExplorerUrlByChain = (chainName: string): string => {
  switch (chainName) {
    case "BSC":
      return BSC_DEFAULT_EXPLORER_URL;
    case "Base":
      return BASE_DEFAULT_EXPLORER_URL;
    case "Arbitrum":
    default:
      return ARB_DEFAULT_EXPLORER_URL;
  }
};

const getChainIdByChainName = (chainName: string) => {
  switch (chainName) {
    case "BSC":
      return bsc.id;
    case "Base":
      return base.id;
    case "Arbitrum":
    default:
      return arbitrum.id;
  }
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
              <Text textStyle="eyebrow">Average 30D APY</Text>
              <Flex gap={1} alignItems="center">
                <Text textStyle="textMono20" fontSize="22px">{pool.avgApr.toFixed(2)} %</Text>
              </Flex>
            </Flex>
            <Flex justifyContent="space-between" alignItems="center">
              <Text textStyle="eyebrow">Total supply</Text>
              <Text textStyle="textMono20" fontSize="22px">$ {formatNumber(pool.funds.toFixed(2))}</Text>
            </Flex>
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
                borderRadius="2px"
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
    <Flex w="100%" h="fit-content" align="center" justify="space-between">
      <Flex align="center" gap="48px" flexDirection={media ? "column" : "row"} className="step-3">
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
          <Text textStyle="eyebrow">Average 30D APY</Text>
          <Flex gap={1} alignItems="center">
            <Text textStyle="textMono20" fontSize="22px">{pool?.avgApr?.toFixed(2)} %</Text>
          </Flex>
        </Flex>

        <Flex direction="column" gap="8px">
          <Text textStyle="eyebrow">Total supply</Text>
          <Text textStyle="textMono20" fontSize="22px">$ {formatNumber(pool?.funds?.toFixed(2))}</Text>
        </Flex>
      </Flex>

      {ROUTES_TYPE.lending === pathName && (
        <Flex p="16px 24px" gap="24px" border="1px solid" borderColor="line" borderRadius="2px">
          <Flex direction="column" gap="8px">
            <Text textStyle="eyebrow">Risk factor</Text>
            <Text
              p="0 10px"
              bg={riskBgColor[pool?.risk]}
              w="fit-content"
              fontSize="xl"
              fontWeight="500"
              color={riskColor[pool?.risk]}
              borderRadius="2px"
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
