"use client";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { CacheProvider } from "@chakra-ui/next-js";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { themes } from "../themes";
import { wagmiConfig } from "../utils/w3";
import { mainnet } from "viem/chains";
import { RAINBOW_THEME } from "@/consts";
import MagicProvider from "@/contexts/useMagic";
import { observer } from "mobx-react-lite";
import { useStore } from "@/hooks/useStoreContext";
import ConnectDisclaimer from "@/components/modal/ConnectDisclaimer";

const queryClient = new QueryClient();

export const Providers = observer(({ children }: { children: React.ReactNode }) => {
  const { activeChain } = useStore("poolsStore");

  return (
    <CacheProvider>
      <ChakraProvider theme={themes}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              modalSize="compact"
              initialChain={mainnet}
              theme={RAINBOW_THEME}
              locale="en-US"
              appInfo={{
                appName: "Invictus",
                disclaimer: () => <ConnectDisclaimer />
              }}
            >
              <MagicProvider>{children}</MagicProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ChakraProvider>
    </CacheProvider>
  );
});
