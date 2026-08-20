import BigDecimal from "decimal.js-light";
import {
  ARB_CONFIRMATIONS_COUNT,
  BASE_CONFIRMATIONS_COUNT,
  BASE_DEFAULT_EXPLORER_URL,
  BIG_1E18,
  BIG_1E6,
  BIG_1E8,
  BIG_1E9,
  BSC_CONFIRMATIONS_COUNT
} from "@/consts";
import { ICHAIN } from "@/types";
import { base, bsc } from "viem/chains";

export const ellipsis = (string: string, chars = 4) => {
  if (!string) return "";
  return `${string.substring(0, chars)}...${string.substring(string.length - chars)}`;
};

export const getValueByDecimal = (decimals: number) => {
  switch (decimals) {
    case 6:
      return BIG_1E6;
    case 8:
      return BIG_1E8;
    case 9:
      return BIG_1E9;
    default:
      return BIG_1E18;
  }
};

export const convertBigIntToNumber = (value: bigint | unknown, decimals: number = 1) => {
  if (!value) {
    return 0;
  }
  const val = typeof value === "bigint" ? value?.toString() : value;

  return +val / getValueByDecimal(decimals);
};

export const performApprovedAmountValue = (value: bigint | undefined, decimals: number) => {
  if (!value) return 0;

  return convertBigIntToNumber(value, decimals);
};

export const convertNumberToBigInt = (value: number = 0, decimals: number): bigint => {
  return BigInt(Math.round(value * Math.pow(10, decimals)));
};

export const getExplorerTxLink = (txHash: string, chainName: ICHAIN) => {
  if (chainName === "Ethereum") {
    return `https://etherscan.io/tx/${txHash}`;
  }

  if (chainName === "BSC") {
    return `https://bscscan.com/tx/${txHash}`;
  }

  if (chainName === "Base") {
    return `${BASE_DEFAULT_EXPLORER_URL}/tx/${txHash}`;
  }

  return `https://arbiscan.io/tx/${txHash}`;
};

export const scrollToElement = (id: string) => {
  const element = document.getElementById(id);

  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
};

export const formatSharesNumber = (numStr: string): string => {
  const validNumber = parseFloat(numStr);

  const flooredNumber = Math.floor(validNumber * 10 ** 5) / 10 ** 5;

  return flooredNumber.toFixed(5);
};

export function getDaysLeft(unlockTime: number, duration: number): string {
  const currentTime = Math.floor(Date.now() / 1000);

  if (unlockTime <= currentTime) {
    return "0 / 0 days";
  }

  const secondsLeft = unlockTime - currentTime;
  const daysLeft = Math.ceil(secondsLeft / (60 * 60 * 24));

  const totalDays = Math.ceil(duration / (60 * 60 * 24));

  return `${daysLeft} / ${totalDays} days`;
}

export function isUnlocked(unlockTime: number): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime >= unlockTime;
}

export const getConfirmationsCount = (chain: ICHAIN) => {
  switch (chain) {
    case "BSC":
      return BSC_CONFIRMATIONS_COUNT;
    case "Base":
      return BASE_CONFIRMATIONS_COUNT;
    case "Arbitrum":
      return ARB_CONFIRMATIONS_COUNT;
  }
};

export const getChainNameById = (chainId: number): ICHAIN => {
  switch (chainId) {
    case bsc.id:
      return "BSC";
    case base.id:
      return "Base";
    default:
      return "Arbitrum";
  }
};
