import { ICON_NAMES } from "./iconNames";

export const CHAIN_ICONS: Record<number, string> = {
  11155111: ICON_NAMES.arbitrum,
  42161: ICON_NAMES.arbitrum,
  56: ICON_NAMES.bnbChain,
  10: ICON_NAMES.optimism,
  8453: ICON_NAMES.base,
  1: ICON_NAMES.ethereum,
};

export const CHAIN_NAMES: Record<number, string> = {
  42161: "Arbitrum",
  56: "Binance Smart Chain",
  10: "Optimism",
  8453: "Base",
  1: "Ethereum",
};
// 11155111 sepolia

export const ARB_DECIMALS = 18;
