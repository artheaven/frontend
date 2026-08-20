"use client";
import { useEffect, useState } from "react";
import { getAreaChartAllIntervalsWithoutToken } from "@/api/pools/queries";
import { PoolLayout } from "@/layout/PoolLayout";
import { PoolsLending } from "@/pagesComponents/Pools/PoolsLending";
import { useAccount } from "wagmi";
import { useMediaQuery } from "@chakra-ui/react";
import PoolsLendingTable from "@/pagesComponents/Pools/PoolsLending/Table";
import { useStore } from "@/hooks/useStoreContext";
import { observer } from "mobx-react-lite";
import { getEarnedPoints } from "@/api/points/queries";

const LendingPage = observer(({ params }: { params: { [key: string]: string } }) => {
  const { address, chain } = useAccount();
  const [chartData, setChartData] = useState<any>(null);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop] = useMediaQuery("(min-width: 1130px)");
  const [isTableView, setIsTableView] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const {
    pools,
    isFetched: isFetchedPools,
    error: poolsError,
    fetchPools,
    startPolling,
    stopPolling,
    activeChain
  } = useStore("poolsStore");

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPools("lending", activeChain);
      startPolling("lending", activeChain);
    }, 300);

    return () => {
      stopPolling();
      clearTimeout(timer);
    };
  }, [fetchPools, startPolling, stopPolling, activeChain]);

  useEffect(() => {
    if (!isDesktop) {
      setIsTableView(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    if (address) {
      const fetchPoints = async () => {
        const points = await getEarnedPoints(address).finally(() => setIsLoadingPoints(false));
        setEarnedPoints(points);
      };

      fetchPoints();
    }
  }, [address]);

  return (
    <PoolLayout
      pools={pools}
      chartData={chartData}
      loading={isChartLoading}
      error={error}
      isTable={isTableView}
      onChangeView={() => setIsTableView(!isTableView)}
      earnedPoints={earnedPoints}
      isLoadingPoints={isLoadingPoints}
    >
      {isTableView ? (
        <PoolsLendingTable pools={pools} isLoading={!isFetchedPools} error={poolsError?.message} />
      ) : (
        <PoolsLending pools={pools} loading={!isFetchedPools} error={poolsError?.message || ""} />
      )}
    </PoolLayout>
  );
});

export default LendingPage;
