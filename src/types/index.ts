import { Placement } from "react-joyride";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DefaultDataType = Record<string, any>;

export type AddressType = `0x${string}`;

export type TutorialStep = {
  target: string;
  content: string;
  spotlightClicks?: boolean;
  disableBeacon?: boolean;
  // placement?: "center" | "auto" | Placement;
  placement?: Placement;
  hideFooter?: boolean;
  isFixed?: boolean;
};

export type TaskType = "twitter" | "telegram" | "wallet" | "deposit" | "freeze" | "frax";

export type Task = {
  name: string;
  complete: boolean;
  type: TaskType;
  limited?: boolean;
  disabled?: boolean;
};

//{"address":"0xd02df454eebf85278b3c257ebc880709dc5e96ce","reward":null,"claimable":null,"proof":null}

export type Reward = {
  address: string;
  reward: string | null;
  claimable: string | null;
  proof: string | null;
};

export type TaskData = {
  twitter: boolean;
  telegram: boolean;
  wallet: boolean;
  deposit: boolean;
  freeze: boolean;
  frax: boolean;
};

export type LockApi = {
  network: string;
  lockId: number;
  token: string;
  amount: bigint;
  duration: number;
  unlockTime: number;
  unlockedTime: number;
};

export type ICHAIN = "Ethereum" | "BSC" | "Arbitrum" | "Base";
