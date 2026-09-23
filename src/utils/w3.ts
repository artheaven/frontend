"use client";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  walletConnectWallet,
  metaMaskWallet,
  injectedWallet,
  coinbaseWallet
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "@wagmi/core";
import { arbitrum, Chain, base, mainnet } from "wagmi/chains";
import { magicWallet } from "./magicConnector";

const createConnectors = (chain: Chain) => {
  return connectorsForWallets(
    [
      {
        groupName: "Popular",
        wallets: [
          injectedWallet,
          metaMaskWallet,
          walletConnectWallet,
          coinbaseWallet,
          () => magicWallet(chain)
        ]
      }
    ],
    {
      appName: "Invictus",
      projectId: process?.env?.NEXT_PUBLIC_WALLETCONNECT_KEY || ""
    }
  );
};

export const wagmiConfig = createConfig({
  chains: [arbitrum, base, mainnet],
  connectors: createConnectors(mainnet),
  ssr: true,
  syncConnectedChain: true,
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http()
  }
});
