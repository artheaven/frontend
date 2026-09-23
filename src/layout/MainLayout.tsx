"use client";
import { Flex } from "@chakra-ui/react";
import { arbitrum, base, bsc, mainnet } from "wagmi/chains";
import { AppFooter } from "../widgets/AppFooter";
import { AppHeader } from "../widgets/AppHeader";
import { useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { observer } from "mobx-react-lite";
import { useStore } from "@/hooks/useStoreContext";
import { ICHAIN } from "@/types";

export const MainLayout = observer(({ children }: { children: React.ReactNode }) => {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { setActiveChain, activeChain } = useStore("poolsStore");

  // Get chain ID from active chain name
  const getChainId = (chainName: string): number => {
    switch (chainName) {
      case "BSC":
        return bsc.id;
      case "Base":
        return base.id;
      case "Arbitrum":
        return arbitrum.id;
      case "Ethereum":
        return mainnet.id;
      default:
        return mainnet.id;
    }
  };

  // Get chain name from chain ID
  const getChainName = (id: number): ICHAIN => {
    switch (id) {
      case mainnet.id:
        return "Ethereum";
      case bsc.id:
        return "BSC";
      case base.id:
        return "Base";
      case arbitrum.id:
        return "Arbitrum";
      default:
        return "Ethereum";
    }
  };

  // Check if chain is supported
  const isSupportedChain = (id: number | undefined): boolean => {
    return id === mainnet.id || id === arbitrum.id || id === bsc.id || id === base.id;
  };

  // Switch to correct chain if unsupported chain is detected
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isConnected && !isSupportedChain(chainId)) {
      timer = setTimeout(() => {
        const targetChainId = getChainId(activeChain);
        switchChain({ chainId: targetChainId });
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [isConnected, chainId, activeChain]);

  // Update active chain in store when connected
  useEffect(() => {
    if (isConnected && isSupportedChain(chainId)) {
      const chainName = getChainName(chainId!);
      setActiveChain(chainName);
    }
  }, [chainId, isConnected]);

  return (
    <Flex direction="column" minH="100vh" alignItems="center" w="100%">
      <AppHeader />
      <Flex flex="1 0" w="100%">
        {children}
      </Flex>
      <AppFooter />
    </Flex>
  );
});
