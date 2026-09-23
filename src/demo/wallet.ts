/**
 * "Demo wallet" for RainbowKit: wagmi's mock connector with a fixed placeholder account.
 * It never signs or sends real transactions.
 *
 * wagmi's mock keeps its "connected" flag in memory only, so a page reload leaves a stale
 * connection that can neither reconnect nor disconnect. We persist the flag ourselves.
 */
import type { Wallet } from "@rainbow-me/rainbowkit";
import { createConnector } from "wagmi";
import { mock } from "wagmi/connectors";
import { DEMO_ADDRESS } from "./config";

const CONNECTED_KEY = "invictus-demo-wallet-connected";

const isConnectedFlag = () => {
  try {
    return window.localStorage.getItem(CONNECTED_KEY) === "1";
  } catch {
    return false;
  }
};

const setConnectedFlag = (value: boolean) => {
  try {
    if (value) window.localStorage.setItem(CONNECTED_KEY, "1");
    else window.localStorage.removeItem(CONNECTED_KEY);
  } catch {
    /* storage unavailable */
  }
};

export const demoWallet = (): Wallet => ({
  id: "demo",
  name: "Demo wallet",
  iconUrl: "/assets/demo-wallet.svg",
  iconBackground: "#171A1F",
  installed: true,
  createConnector: walletDetails =>
    createConnector(config => {
      const base = mock({ accounts: [DEMO_ADDRESS], features: { reconnect: true } })(config);
      return {
        ...base,
        ...walletDetails,
        async connect(params) {
          const result = await base.connect.call(this, params);
          setConnectedFlag(true);
          return result;
        },
        async disconnect() {
          setConnectedFlag(false);
          await base.disconnect.call(this);
        },
        async isAuthorized() {
          return isConnectedFlag();
        },
        async getAccounts() {
          return isConnectedFlag() ? [DEMO_ADDRESS] : base.getAccounts.call(this);
        }
      } as typeof base;
    })
});
