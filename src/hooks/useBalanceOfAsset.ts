import { formatUnits } from "ethers";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";

import { ABI_REBALANCE } from "../abi/rebalance";
import { DEMO_ADDRESS, DEMO_MODE } from "@/demo/config";
import { DEMO_POOLS } from "@/demo/data";

const demoBalance = (contractAddress: string, ownerAddress: string) =>
  ownerAddress.toLowerCase() === DEMO_ADDRESS.toLowerCase()
    ? DEMO_POOLS.find(p => p.vaultAddress.toLowerCase() === contractAddress?.toLowerCase())?.demoDeposit ?? 0
    : 0;

export const useBalanceOfAsset = (
  contractAddress: `0x${string}`,
  ownerAddress: `0x${string}`,
  decimals: number
) => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const {
    data,
    isLoading: loading,
    refetch,
  } = useReadContract({
    address: contractAddress,
    abi: ABI_REBALANCE,
    functionName: "getBalanceOfAsset",
    args: [ownerAddress],
    query: { enabled: !DEMO_MODE }
  });

  useEffect(() => {
    if (DEMO_MODE) {
      setBalance(demoBalance(contractAddress, ownerAddress));
      setIsLoading(false);
      return;
    }
    if (data) {
      const formattedBalance = formatUnits(data, decimals);
      setBalance(+formattedBalance);
    }
    setIsLoading(false);
  }, [data, loading, decimals, contractAddress, ownerAddress]);

  useEffect(() => {
    if (DEMO_MODE) return;
    const interval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [refetch]);

  return { balance, isLoading };
};
