/**
 * Demo ledger: simulated wallet balances, vault positions and allowances.
 * Operations resolve after a short delay to mimic a confirmed transaction.
 * State survives reloads (localStorage) and resets when the demo wallet disconnects.
 */
import { makeAutoObservable, runInAction } from "mobx";
import { DEMO_POOLS } from "./data";

const STORAGE_KEY = "invictus-demo-ledger-v1";
const TX_DELAY_MS = 1600;

type State = {
  wallet: Record<string, number>; // token symbol → units
  positions: Record<string, number>; // vault address (lowercase) → asset units
  allowances: Record<string, number>; // vault address (lowercase) → asset units
};

const initialState = (): State => ({
  wallet: { USDC: 50_000, USDT: 30_000, DAI: 20_000 },
  positions: Object.fromEntries(DEMO_POOLS.map(p => [p.vaultAddress.toLowerCase(), p.demoDeposit])),
  allowances: {}
});

const fakeTxHash = () =>
  `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as `0x${string}`;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

class DemoLedger {
  state: State = initialState();

  constructor() {
    makeAutoObservable(this);
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) this.state = { ...initialState(), ...JSON.parse(saved) };
      } catch {
        /* storage unavailable — keep defaults */
      }
    }
  }

  private persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      /* ignore */
    }
  }

  walletBalance(token: string) {
    return this.state.wallet[token] ?? 0;
  }

  position(vault: string) {
    return this.state.positions[vault.toLowerCase()] ?? 0;
  }

  allowance(vault: string) {
    return this.state.allowances[vault.toLowerCase()] ?? 0;
  }

  /** Net change of a vault's position since the initial demo state (for pool TVL). */
  positionDelta(vault: string) {
    const initial = DEMO_POOLS.find(p => p.vaultAddress.toLowerCase() === vault.toLowerCase())?.demoDeposit ?? 0;
    return this.position(vault) - initial;
  }

  async approve(vault: string, amount: number) {
    await sleep(TX_DELAY_MS * 0.7);
    runInAction(() => {
      this.state.allowances[vault.toLowerCase()] = amount;
      this.persist();
    });
    return fakeTxHash();
  }

  async deposit(vault: string, token: string, amount: number) {
    await sleep(TX_DELAY_MS);
    if (amount <= 0 || amount > this.walletBalance(token) + 1e-9) throw new Error("Insufficient wallet balance");
    if (amount > this.allowance(vault) + 1e-9) throw new Error("Allowance too low");
    runInAction(() => {
      const key = vault.toLowerCase();
      this.state.wallet[token] = this.walletBalance(token) - amount;
      this.state.positions[key] = this.position(vault) + amount;
      this.state.allowances[key] = this.allowance(vault) - amount;
      this.persist();
    });
    return fakeTxHash();
  }

  async withdraw(vault: string, token: string, amount: number) {
    await sleep(TX_DELAY_MS);
    if (amount <= 0 || amount > this.position(vault) + 1e-9) throw new Error("Amount exceeds position");
    runInAction(() => {
      this.state.positions[vault.toLowerCase()] = this.position(vault) - amount;
      this.state.wallet[token] = this.walletBalance(token) + amount;
      this.persist();
    });
    return fakeTxHash();
  }

  reset() {
    this.state = initialState();
    this.persist();
  }
}

export const demoLedger = new DemoLedger();
