import { IToken } from "@/api/tokens/types";
import { defChainIdArbitrum } from "@/hooks/useAuth";
import { Task } from "@/types";

export * from "./chains";
export * from "./iconNames";
export * from "./mediaQuery";
export * from "./routes";
export * from "./time";
export * from "./tokenIcons";

export const BIG_1E6 = 1000000;
export const BIG_1E8 = 100000000;
export const BIG_1E9 = 1000000000;
export const BIG_1E10 = 10000000000;
export const BIG_1E16 = 10000000000000000;
export const BIG_1E18 = 1000000000000000000;
export const BIG_1E20 = 100000000000000000000;

export const ARB_DEFAULT_EXPLORER_URL = "https://arbiscan.io";
export const ARB_CONFIRMATIONS_COUNT = 50;

export const BSC_DEFAULT_EXPLORER_URL = "https://bscscan.com";
export const BSC_CONFIRMATIONS_COUNT = 4;

export const BASE_DEFAULT_EXPLORER_URL = "https://basescan.org";
export const BASE_CONFIRMATIONS_COUNT = 3;

export const PARASWAP_SPENDER_ADDRESS = "0x216B4B4Ba9F3e719726886d34a177484278Bfcae";

export const USDT_TOKEN: IToken = {
  address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  symbol: "USDT",
  name: "Tether USD",
  decimals: 6,
  chainId: defChainIdArbitrum,
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
};

export const ARB_TOKEN: IToken = {
  address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
  symbol: "ARB",
  name: "Arbitrum",
  decimals: 18,
  chainId: defChainIdArbitrum,
  logoURI: "https://arbitrum.foundation/logo.png"
};

export const BALANCE_ERROR = "Insufficient funds";

export const DEPOSIT_SUCESS = "Deposit successful";

export const WITHDRAW_SUCESS = "Withdraw successful";

export const FIRELABS_AUDIT_LINK = "https://4irelabs.com/smart-contract-audit/";

export const HACKEN_AUDIT_LINK = "https://hacken.io/audits/rebalance/";

export const LOCAL_STORAGE_KEYS = {
  isShownTutorial: "isShownTutorial",
  isShownTasks: "isShownTasks",
  isSentDepositEvent: "isSentDepositEvent"
};

export const TWITTER_FOLLOW_URL = "https://x.com/intent/user?screen_name=rebalancefin";

export const TELEGRAM_FOLLOW_LINK = "https://t.me/+sQu_wAoL_FtlNjgy";

export const MOCKED_TASKS: Array<Task> = [
  {
    name: "Connect wallet",
    type: "wallet",
    complete: false
  },
  {
    name: "Follow us on Twitter",
    type: "twitter",
    complete: false
  },
  {
    name: "Join us on Telegram",
    type: "telegram",
    complete: false
  },
  {
    name: "Make a deposit",
    type: "deposit",
    complete: false
  },
  {
    name: "Freeze deposit to farm points",
    type: "freeze",
    complete: false
  }
];

export const NEW_MOCKED_TASKS: Array<Task> = [
  {
    name: "Connect wallet",
    type: "wallet",
    complete: false
  },
  // {
  //   name: "Deposit & freeze any FRAX amount",
  //   type: "frax",
  //   complete: false,
  //   limited: true
  // },
  {
    name: "Follow us on Twitter",
    type: "twitter",
    complete: false
  },
  {
    name: "Join us on Telegram",
    type: "telegram",
    complete: false
  }
];

export const MOCKED_ADDRESS = "0xA61327155f2b17A23648B208B4E5F141fBA77F7A";

export const DEPOSIT_STEPS_BASIC = ["Approve", "Deposit"];

export const DEPOSIT_STEPS_WITH_FREEZE = ["Approve", "Deposit", "Approve", "Freeze"];

export const ARB_TOKEN_ADDRESS = "0x912CE59144191C1204E64559FE8253a0e49E6548";

export const FRAX_TOKEN_ADDRESS = "0x7468a5d8E02245B00E8C0217fCE021C70Bc51305";

export const LOCK_TOKENS_CONTRACT_ADDRESS = "0x4c2db56998fEEb681bf82524b0cF8Dc4D99D2132";

export const INSUFFICIENT_BALANCE_ERROR = "You balance is insufficient";

// RainbowKit theme in Invictus tokens (see src/themes/styles/colors.ts).
export const RAINBOW_THEME = {
  colors: {
    accentColor: "var(--inv-accent)",
    accentColorForeground: "var(--inv-bg)",
    actionButtonBorder: "var(--inv-line)",
    actionButtonBorderMobile: "var(--inv-line)",
    actionButtonSecondaryBackground: "var(--inv-bg3)",
    closeButton: "var(--inv-ink3)",
    closeButtonBackground: "var(--inv-bg3)",
    connectButtonBackground: "var(--inv-bg)",
    connectButtonBackgroundError: "var(--inv-neg)",
    connectButtonInnerBackground: "var(--inv-bg3)",
    connectButtonText: "var(--inv-ink)",
    connectButtonTextError: "var(--inv-ink)",
    error: "var(--inv-neg)",
    generalBorder: "var(--inv-line)",
    generalBorderDim: "var(--inv-bg3)",
    menuItemBackground: "var(--inv-bg3)",
    modalBackdrop: "rgba(10, 11, 13, 0.6)",
    modalBackground: "var(--inv-bg2)",
    modalBorder: "var(--inv-line)",
    modalText: "var(--inv-ink)",
    modalTextDim: "var(--inv-muted)",
    modalTextSecondary: "var(--inv-ink3)",
    profileAction: "var(--inv-bg3)",
    profileActionHover: "var(--inv-line)",
    profileForeground: "var(--inv-bg2)",
    selectedOptionBorder: "var(--inv-accent)",
    downloadBottomCardBackground: "var(--inv-bg2)",
    downloadTopCardBackground: "var(--inv-bg3)",
    connectionIndicator: "var(--inv-pos)",
    standby: "var(--inv-accent)"
  },
  radii: {
    actionButton: "2px",
    connectButton: "2px",
    menuButton: "2px",
    modal: "2px",
    modalMobile: "2px"
  },
  shadows: {
    connectButton: "none",
    dialog: "none",
    profileDetailsAction: "none",
    selectedOption: "none",
    selectedWallet: "none",
    walletLogo: "none"
  },
  blurs: {
    modalOverlay: "blur(4px)"
  },
  fonts: {
    body: "inherit"
  }
};

export const LINK_TERMS_OF_SERVICE =
  "https://docs.google.com/document/d/1c4CE-5Gj3JkQWwGPOIvJBXWndKk1kB51b8SeLQXNN0o";

export const LINK_PRIVACY_NOTICE =
  "https://docs.google.com/document/d/1PF4ik8sHbVqW8Lb8l6yo2H2vuQEZnr__-Ga2CMYW2yw";
