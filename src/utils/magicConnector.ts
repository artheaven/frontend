import { dedicatedWalletConnector } from "@magiclabs/wagmi-connector";
import type { Wallet } from "@rainbow-me/rainbowkit";
import type { Chain } from "viem";
import { arbitrum, bsc, base } from "viem/chains";
import { createConnector } from "wagmi";
import { tokens } from "@/themes/styles/colors";

export const createMagicConnector = ({ chain }: { chain: Chain }): Wallet => ({
  id: "magic",
  name: "Magic",
  iconUrl: "/assets/image/Magic.svg",
  iconBackground: tokens.ink,
  installed: true,
  iconAccent: tokens.accent,

  createConnector: walletDetails => {
    const magicConnector = dedicatedWalletConnector({
      chains: [bsc, arbitrum, base],
      options: {
        customLogo: "https://app.rebalance.finance/assets/logo/logo-short.svg",
        apiKey: process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY as string,
        accentColor: tokens.accent,
        isDarkMode: true,
        magicSdkConfiguration: {
          network: {
            chainId: chain.id,
            rpcUrl: chain.rpcUrls.default.http[0]
          }
        }
      }
    });

    return createConnector(config => ({
      ...magicConnector(config),
      ...walletDetails
    }));
  }
});

export const magicWallet = (chain: Chain) => createMagicConnector({ chain });
