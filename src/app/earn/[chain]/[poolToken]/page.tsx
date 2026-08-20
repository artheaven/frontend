"use client";
import { observer } from "mobx-react-lite";
import { LendingAsset } from "@/pagesComponents/AssetsPages/LendingAsset";
import { useEffect, useState } from "react";
import { useStore } from "@/hooks/useStoreContext";
import { useAccount, useSwitchChain } from "wagmi";
import { arbitrum, bsc, base, mainnet } from "viem/chains";

const LendingAssetPage = observer(({ params }: { params: { [key: string]: string } }) => {
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const {
    activePool,
    setActivePool,
    fetchAndSetActivePool,
    fetchChartData,
    chartData,
    isChartLoading
  } = useStore("poolStore");

  const { setActiveChain } = useStore("poolsStore");
  const { pools, isLoading } = useStore("poolsStore");
  const [error, setError] = useState<string | null>(null);

  const getChainName = () => {
    switch (params.chain) {
      case "eth":
        return "Ethereum";
      case "bsc":
        return "BSC";
      case "base":
        return "Base";
      case "arbitrum":
        return "Arbitrum";
      default:
        return "Ethereum";
    }
  };

  useEffect(() => {
    setActiveChain(getChainName());
  }, [params.chain]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isConnected) {
      let targetChainId;

      switch (params.chain) {
        case "eth":
          targetChainId = mainnet.id;
          break;
        case "bsc":
          targetChainId = bsc.id;
          break;
        case "base":
          targetChainId = base.id;
          break;
        case "arbitrum":
          targetChainId = arbitrum.id;
          break;
        default:
          targetChainId = mainnet.id;
          break;
      }

      if (chainId !== targetChainId) {
        timer = setTimeout(() => {
          switchChain({ chainId: targetChainId });
        }, 500);
      }
    }

    return () => clearTimeout(timer);
  }, [isConnected, chainId, params.chain]);

  useEffect(() => {
    if (!activePool) {
      fetchAndSetActivePool("lending", params.poolToken, getChainName());
    }
  }, [activePool]);

  useEffect(() => {
    if (!activePool && pools.length > 0 && !isLoading) {
      const pool = pools.find(pool => pool?.token === params.poolToken);

      if (pool) {
        setActivePool(pool);
      }
    }
  }, [activePool, pools.length, isLoading]);

  useEffect(() => {
    if (activePool) {
      const token = activePool.token;
      fetchChartData(token, getChainName());
    }
  }, [params.poolToken, activePool]);

  const getChainId = () => {
    switch (params.chain) {
      case "eth":
        return mainnet.id;
      case "bsc":
        return bsc.id;
      case "base":
        return base.id;
      case "arbitrum":
        return arbitrum.id;
      default:
        return mainnet.id;
    }
  };

  return (
    <LendingAsset
      pool={activePool}
      chartData={chartData}
      loading={!activePool}
      error={error}
      isChartLoading={isChartLoading}
      poolChainId={getChainId()}
      chainName={getChainName()}
    />
  );
});

export default LendingAssetPage;
