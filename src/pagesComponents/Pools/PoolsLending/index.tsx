"use client";
import { Box, Divider, Flex, HStack, SimpleGrid, Text, Skeleton } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { CardPool } from "../../../components/card";
import { Risk } from "../../../components/risk";
import { Tooltip } from "../../../components/tooltip";
import { ICON_NAMES, ROUTE_PATHS } from "../../../consts";
import { DepositLendingButton } from "../../../features/actions/deposit-or-withdraw-button/DepositLendingButton";
import { WithdrawLendingButton } from "../../../features/actions/deposit-or-withdraw-button/WithdrawLendingButton";
import { formatNumber, formatPercent, formatNeutralPercent } from "../../../utils/formatNumber";
import { IPoolData, IRowCard, RowCardNames, RowCardProccessType } from "../types";
import DepositInfo from "./components/DepositInfo";
import UserProfitPool from "./components/UserProfitPool";
import Icon from "@/components/icon";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/useStoreContext";
import { getIdByToken } from "@/utils/analytics";
import { observer } from "mobx-react-lite";

type Protocol =
  | "AAVE"
  | "COMPOUND"
  | "DOLOMITE"
  | "FRAXLEND"
  | "KINZA"
  | "VENUS"
  | "MORPHO_SPARK"
  | "MORPHO_MOONWELL"
  | "MORPHO_SEAMLESS"
  | "MORPHO_STEAKHOUSE"
  | "MORPHO_GAUNTLET_PRIME"
  | "MORPHO_GAUNTLET_CORE"
  | "MORPHO_APOSTRO";

interface TokenProtocolMap {
  [chain: string]: {
    [token: string]: Protocol[];
  };
}

const YieldPoolList = ({ pools }: { pools: string[] }) => (
  <>
    {pools.map((pool, index) => (
      <span key={index}>
        <br />- {pool}
      </span>
    ))}
  </>
);

export const PoolsLending = observer(
  ({ pools, loading, error }: { pools: IPoolData[]; loading: boolean; error: string | null }) => {
    const { address } = useAccount();
    const router = useRouter();
    const poolStore = useStore("poolStore");
    const { activeChain } = useStore("poolsStore");

    const getChainRouteName = () => {
       if (activeChain === "Ethereum") return "eth";
      if (activeChain === "BSC") return "bsc";
      if (activeChain === "Base") return "base";
      return "eth";
    };

    const handleCardClick = (event: any, pool: IPoolData) => {
      if ((event.target as HTMLElement).closest("button")) {
        return;
      }
      poolStore.setActivePool(pool);
      router.push(ROUTE_PATHS.lendingAssetPage(getChainRouteName(), pool.token), { scroll: false });
    };

    // Protocol mapping configuration based on token and chain
    const tokenProtocolMap: TokenProtocolMap = {
      Arbitrum: {
        USDT: ["AAVE", "COMPOUND", "DOLOMITE"],
        wETH: ["AAVE", "COMPOUND", "DOLOMITE"],
        USDC: ["AAVE", "COMPOUND", "DOLOMITE"],
        "USDC.e": ["AAVE", "COMPOUND", "DOLOMITE"],
        DAI: ["AAVE", "DOLOMITE"],
        FRAX: ["AAVE", "FRAXLEND"]
      },
      BSC: {
        USDT: ["AAVE", "KINZA", "VENUS"],
        USDC: ["AAVE", "KINZA", "VENUS"]
      },
      Base: {
        USDC: [
          "AAVE",
          "COMPOUND",
          "MORPHO_SPARK",
          "MORPHO_MOONWELL",
          "MORPHO_SEAMLESS",
          "MORPHO_STEAKHOUSE",
          "MORPHO_GAUNTLET_PRIME",
          "MORPHO_GAUNTLET_CORE",
          "MORPHO_APOSTRO"
        ]
      }
    };

    // Get pretty names for protocols in tooltip
    const getProtocolPrettyName = (protocol: Protocol): string => {
      const protocolDisplayMap: Record<Protocol, string> = {
        AAVE: "Aave V3",
        COMPOUND: "Compound V3",
        DOLOMITE: "Dolomite",
        FRAXLEND: "Fraxlend",
        KINZA: "Kinza",
        VENUS: "Venus",
        MORPHO_SPARK: "Morpho Spark USDC Vault",
        MORPHO_MOONWELL: "Morpho Moonwell Flagship USDC",
        MORPHO_SEAMLESS: "Morpho Seamless USDC Vault",
        MORPHO_STEAKHOUSE: "Morpho Steakhouse USDC",
        MORPHO_GAUNTLET_PRIME: "Morpho Gauntlet USDC Prime",
        MORPHO_GAUNTLET_CORE: "Morpho Gauntlet USDC Core",
        MORPHO_APOSTRO: "Morpho Apostro Resolv USDC"
      };
      return protocolDisplayMap[protocol];
    };

    const getYieldStrategy = (token: string) => {
      const baseMessage = `${token} Low-Risk Yield Strategy: Higher APY is achieved by automatic rebalance between the following pools:`;

      const protocols = tokenProtocolMap[activeChain]?.[token] || [];
      const pools = protocols.map(getProtocolPrettyName);

      return (
        <>
          <span>{baseMessage}</span>
          <YieldPoolList pools={pools} />
        </>
      );
    };

    const getProtocolIcons = (token: string) => {
      const protocols = tokenProtocolMap[activeChain]?.[token] || [];

      if (protocols.length === 0) return null;

      return (
        <Box ml="auto" display="flex">
          {protocols.map((protocol, idx) => {
            if (protocol.startsWith("MORPHO_")) {
              return (
                <Box
                  key={idx}
                  marginRight={idx < protocols.length - 1 ? "-4px" : 0}
                  zIndex={protocols.length - idx}
                >
                  <Icon name={protocol} width="14px" height="14px" />
                </Box>
              );
            }

            return (
              <Box
                key={idx}
                borderRadius={protocol === "DOLOMITE" ? "50%" : undefined}
                marginRight={idx < protocols.length - 1 ? "-4px" : 0}
                zIndex={protocols.length - idx}
              >
                <Icon
                  name={protocol}
                  width={protocol === "AAVE" ? "10px" : "14px"}
                  height={protocol === "AAVE" ? "10px" : "14px"}
                />
              </Box>
            );
          })}
        </Box>
      );
    };

    const rowCard: IRowCard[] = [
      {
        name: RowCardNames.header,
        proccess({ item }) {
          return (
            <Flex direction="column" alignItems="center">
              <Tooltip
                label={
                  <span>
                    Asset risk - 1<br />
                    Protocols risk - 1
                  </span>
                }
                color="white"
              >
                <Text textStyle="eyebrow" mb="4px">
                  RISK
                </Text>
              </Tooltip>
              <Risk risk={item.risk} />
            </Flex>
          );
        }
      },
      {
        name: RowCardNames.body,
        proccess({ item, type }) {
          switch (type) {
            case RowCardProccessType.metrics:
              return (
                <>
                  <HStack justify="space-between">
                    <Text textStyle="eyebrow">Funds in pool</Text>
                    <Tooltip label="Funds in pool" color="white">
                      <Text textStyle="textMono16" color="ink">
                        {loading || error ? (
                          <Skeleton height="20px" width="50px" />
                        ) : (
                          formatNumber(item.funds) + " $"
                        )}
                      </Text>
                    </Tooltip>
                  </HStack>
                  <Divider borderColor="line" />
                  <HStack>
                    <Tooltip label={getYieldStrategy(item.token)}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        w="100%"
                        alignItems="center"
                      >
                        <Text textStyle="eyebrow" borderBottom="1px dashed" borderColor="lineStrong">
                          APY
                        </Text>
                        {getProtocolIcons(item.token)}
                        <Text textStyle="textMono16" ml={2}>
                          {loading || error ? (
                            <Skeleton height="20px" width="50px" />
                          ) : (
                            formatNeutralPercent(item.avgApr)
                          )}
                        </Text>
                      </Box>
                    </Tooltip>
                  </HStack>

                  <HStack justify="space-between">
                    <Tooltip label="Invictus APY advantage over the lending market highest APY in last 30 days">
                      <Text textStyle="eyebrow" borderBottom="1px dashed" borderColor="lineStrong">
                        {">"} market max.
                      </Text>
                    </Tooltip>
                    <Text color={item.apr > 0 ? "pos" : "ink"} textStyle="textMono16">
                      {loading || error ? (
                        <Skeleton height="20px" width="50px" />
                      ) : (
                        formatPercent(item.apr)
                      )}
                    </Text>
                  </HStack>
                </>
              );
            case RowCardProccessType.assets:
              return (
                <>
                  {!!address ? (
                    <>
                      <Divider borderColor="line" />
                      <HStack justify="space-between">
                        <Text textStyle="eyebrow">My profit</Text>
                        <Text textStyle="textMono16">
                          {loading || error ? (
                            <Skeleton height="20px" width="50px" />
                          ) : address ? (
                            <UserProfitPool address={address} token={item.token} />
                          ) : (
                            "0.00"
                          )}
                        </Text>
                      </HStack>
                      <DepositInfo
                        contractAddress={item.rebalancerAddress}
                        ownerAddress={address}
                        tokenName={item?.token}
                        decimals={item.decimals}
                      />
                    </>
                  ) : null}
                </>
              );
            default:
              return <></>;
          }
        }
      },
      {
        name: RowCardNames.footer,
        proccess({ item }) {
          return (
            <>
              <DepositLendingButton
                pool={item}
                minHeight="40px"
                id={
                  address
                    ? `Click_Deposit_${getIdByToken(item.token)}`
                    : `Click_Deposit_start_${getIdByToken(item.token)}`
                }
              />
              <WithdrawLendingButton pool={item} minHeight="40px" />
            </>
          );
        }
      }
    ];

    return (
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
        spacing="24px"
        alignItems="center"
        id="pools"
      >
        {loading || error
          ? Array.from({ length: 4 }).map((_, index) => (
              <Box key={index} padding="6" bg="bg2" border="1px solid" borderColor="line" borderRadius="2px">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Skeleton height="60px" mb="4" w="60px" borderRadius="100px" />
                  <Skeleton height="20px" mb="4" w="60px" />
                </Box>
                <Skeleton height="20px" mb="4" />
                <Skeleton height="20px" mb="4" />
                <Skeleton height="20px" mb="4" />
                <Skeleton height="20px" m="0 auto" />
              </Box>
            ))
          : pools?.map(elem => (
              <Box
                key={elem.token}
                onClick={event => handleCardClick(event, elem)}
                cursor="pointer"
              >
                <CardPool
                  key={elem.token}
                  rowCard={rowCard}
                  itemCard={elem}
                  isBaseChain={activeChain === "Base"}
                />
              </Box>
            ))}
      </SimpleGrid>
    );
  }
);
