"use client";
import { Box, SimpleGrid, Skeleton } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { ROUTE_PATHS } from "../../../consts";
import { IPoolData } from "@/api/pools/types";
import { VaultCard } from "./components/VaultCard";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/useStoreContext";
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

    return (
      <SimpleGrid
        columns={{ base: 1, md: 2, xl: 3 }}
        spacing="24px"
        alignItems="stretch"
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
              <VaultCard
                key={elem.token}
                pool={elem}
                chainName={activeChain}
                address={address}
                loading={loading}
                strategyTooltip={getYieldStrategy(elem.token)}
                onOpen={event => handleCardClick(event, elem)}
              />
            ))}
      </SimpleGrid>
    );
  }
);
