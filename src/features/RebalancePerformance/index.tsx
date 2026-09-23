"use client";

import { Flex, Skeleton, useMediaQuery } from "@chakra-ui/react";
import { IAreaChartData, IPoolData } from "@/api/pools/types";
import { MEDIA_QUERY_MAX } from "../../consts";
import { RebalancePerformanceCard } from "./RebalancePerformanceCard";
import { PerformanceChart } from "./RebalancePerformanceCharts";
import { getCurrentPath, performanceInfo } from "./utils";
import { usePathname } from "next/navigation";
import { formatNumber } from "@/utils/formatNumber";
import { useEffect, useMemo, useState } from "react";
import { getTotalProfit } from "@/api/pools/queries";
import { useAccount } from "wagmi";
import { observer } from "mobx-react-lite";
import { useStore } from "@/hooks/useStoreContext";

export const RebalancePerformance = observer(
  ({
    pools,
    chartData,
    loading
  }: {
    pools: IPoolData[];
    chartData: IAreaChartData;
    loading: boolean;
  }) => {
    const location = usePathname();
    const { address, chain } = useAccount();
    const pathName = getCurrentPath(location || "");
    const [media] = useMediaQuery(MEDIA_QUERY_MAX);
    const totalLending = pools.reduce((acc, pool) => acc + (pool?.funds || 0), 0);
    const info = {
      lending: { value: formatNumber(totalLending) },
      borrowing: { value: pools[0]?.funds.toFixed(2) }
    };
    const [userProfit, setUserProfit] = useState(0);
    const { activeChain } = useStore("poolsStore");

    useEffect(() => {
      if (address) {
        getTotalProfit("lending", address, activeChain).then(data => {
          setUserProfit(data);
        });
      }
    }, [address, activeChain]);

    if (media) {
      return (
        <Flex w="100%" minH="319px">
          {loading ? (
            <Skeleton height="319px" width="100%" />
          ) : (
            <PerformanceChart
              activeType={pathName}
              chartData={chartData}
              showRightAxis={userProfit > 0}
            />
          )}
        </Flex>
      );
    }

    return (
      <Flex gap="24px">
        <Flex direction="column" gap="12px">
          {performanceInfo?.map(elem => (
            <Flex
              key={elem.title}
              textAlign="center"
              borderRadius="3px"
              // p="8px 12px"
              w="100%"
              color={elem.type === pathName ? "" : "black.0"}
              borderColor={elem.type === pathName ? "greenAlpha.100" : "line"}
            >
              <RebalancePerformanceCard
                key={elem.title}
                title={elem.title}
                subtitle={elem.subtitle}
                image={elem.image}
                info={info[elem.type].value}
                type={elem.type}
                isActive={true}
                logo={elem.logo}
                logos={elem.logos}
              />
            </Flex>
          ))}
        </Flex>

        <Flex w="100%">
          {loading ? (
            <Skeleton height="100%" width="100%" />
          ) : (
            <PerformanceChart
              activeType={pathName}
              chartData={chartData}
              showRightAxis={userProfit > 0}
            />
          )}
        </Flex>
      </Flex>
    );
  }
);
