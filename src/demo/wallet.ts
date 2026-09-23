/**
 * "Demo wallet" for RainbowKit: wagmi's mock connector with a fixed placeholder account.
 * It never signs or sends real transactions.
 */
import type { Wallet } from "@rainbow-me/rainbowkit";
import { createConnector } from "wagmi";
import { mock } from "wagmi/connectors";
import { DEMO_ADDRESS } from "./config";

export const demoWallet = (): Wallet => ({
  id: "demo",
  name: "Demo wallet",
  iconUrl: "/assets/demo-wallet.svg",
  iconBackground: "#171A1F",
  installed: true,
  createConnector: walletDetails =>
    createConnector(config => ({
      ...mock({ accounts: [DEMO_ADDRESS], features: { reconnect: true } })(config),
      ...walletDetails
    }))
});
