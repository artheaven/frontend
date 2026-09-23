/**
 * DEMO DATA — synthetic values for UI development and demos only.
 * Shapes mirror the backend responses consumed in src/api.
 */
import { DEMO_AS_OF } from "./config";

export interface DemoAllocation {
  protocol: string;
  destination: string;
  share: number; // fraction, 0.38 = 38%
}

export interface DemoPool {
  token: string;
  vaultAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  tokenDecimals: number;
  tokenPrice: number;
  funds: number;
  earned: number;
  avgApr30D: number; // percent, as returned by the API
  highestMarket30DAvgAprDiffPercentage: number; // percent points
  allocations: DemoAllocation[];
  asOf: string;
  /** Simulated wallet position in the pool, in asset units. */
  demoDeposit: number;
}

const vault = (n: number) => `0x${n.toString(16).padStart(40, "0")}` as `0x${string}`;

export const DEMO_POOLS: DemoPool[] = [
  {
    token: "USDC",
    vaultAddress: vault(0xde01),
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    tokenDecimals: 6,
    tokenPrice: 1,
    funds: 48_200_000,
    earned: 1_240_000,
    avgApr30D: 5.12,
    highestMarket30DAvgAprDiffPercentage: 0.84,
    allocations: [
      { protocol: "morpho", destination: "MetaMorpho USDC vault A", share: 0.38 },
      { protocol: "aave", destination: "Aave v3 USDC", share: 0.36 },
      { protocol: "morpho", destination: "Morpho Blue USDC market B", share: 0.18 },
      { protocol: "idle", destination: "Idle buffer", share: 0.08 }
    ],
    asOf: DEMO_AS_OF,
    demoDeposit: 25_000
  },
  {
    token: "USDT",
    vaultAddress: vault(0xde02),
    tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    tokenDecimals: 6,
    tokenPrice: 1,
    funds: 27_900_000,
    earned: 690_000,
    avgApr30D: 4.68,
    highestMarket30DAvgAprDiffPercentage: 0.61,
    allocations: [
      { protocol: "aave", destination: "Aave v3 USDT", share: 0.4 },
      { protocol: "morpho", destination: "MetaMorpho USDT vault A", share: 0.34 },
      { protocol: "morpho", destination: "Morpho Blue USDT market B", share: 0.16 },
      { protocol: "idle", destination: "Idle buffer", share: 0.1 }
    ],
    asOf: DEMO_AS_OF,
    demoDeposit: 12_500
  },
  {
    token: "DAI",
    vaultAddress: vault(0xde03),
    tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    tokenDecimals: 18,
    tokenPrice: 1,
    funds: 9_300_000,
    earned: 210_000,
    avgApr30D: 4.21,
    highestMarket30DAvgAprDiffPercentage: 0.47,
    allocations: [
      { protocol: "aave", destination: "Aave v3 DAI", share: 0.4 },
      { protocol: "morpho", destination: "MetaMorpho DAI vault A", share: 0.4 },
      { protocol: "idle", destination: "Idle buffer", share: 0.2 }
    ],
    asOf: DEMO_AS_OF,
    demoDeposit: 0
  }
];

// ---- deterministic history ----

function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seedOf = (s: string) => s.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export interface Tick {
  from: string;
  to: string;
  value: number | null;
}

/**
 * Newest-first ticks (the backend order). A slow random walk re-centred so that
 * its mean equals `base` — averages shown in the UI match the published figures.
 */
export function demoTicks(key: string, intervalDays: number, count: number, base: number, amplitude: number): Tick[] {
  const DAY = 86_400_000;
  const now = Date.parse(DEMO_AS_OF);
  const rnd = prng(seedOf(`${key}:${intervalDays}`));
  let v = 0;
  const walk: number[] = [];
  for (let i = 0; i < count; i++) {
    v += (rnd() - 0.5) * amplitude * 0.5;
    v -= v * 0.15; // mean reversion
    walk.push(v);
  }
  const mean = walk.reduce((a, x) => a + x, 0) / (count || 1);
  return walk.map((w, i) => ({
    from: new Date(now - (i + 1) * intervalDays * DAY).toISOString(),
    to: new Date(now - i * intervalDays * DAY).toISOString(),
    value: Number(Math.max(0, base + w - mean).toFixed(3))
  }));
}

export const findDemoPool = (token: string | undefined) =>
  DEMO_POOLS.find(p => p.token.toLowerCase() === (token ?? "").toLowerCase());

/** Earned per interval for the demo wallet, in USD: deposit × apr × days / 365. */
export function demoEarnedTicks(pools: DemoPool[], intervalDays: number, count: number): Tick[] {
  const series = pools
    .filter(p => p.demoDeposit > 0)
    .map(p => demoTicks(p.token, intervalDays, count, p.avgApr30D, 1.2));
  if (series.length === 0) return demoTicks("none", intervalDays, count, 0, 0);
  return series[0]!.map((tick, i) => ({
    ...tick,
    value: Number(
      pools
        .filter(p => p.demoDeposit > 0)
        .reduce((sum, p, k) => sum + (p.demoDeposit * p.tokenPrice * (series[k]![i]!.value ?? 0) * intervalDays) / 36_500, 0)
        .toFixed(2)
    )
  }));
}

// ---- rebalance history ----

const REASONS = ["rate", "rate", "rate", "new_liquidity", "utilization", "risk_gate"] as const;

export interface DemoRebalance {
  id: number;
  ts: string;
  from: string;
  to: string;
  amount: number;
  reason: (typeof REASONS)[number];
  txHash: `0x${string}`;
}

/** Newest-first rebalance log for a pool; destinations come from its allocations. */
export function demoRebalances(pool: DemoPool, count = 214): DemoRebalance[] {
  const rnd = prng(seedOf(`${pool.token}:rebalances`));
  const dests = pool.allocations.map(a => a.destination);
  const now = Date.parse(DEMO_AS_OF);
  let t = now - 40 * 60_000;
  const out: DemoRebalance[] = [];
  for (let i = 0; i < count; i++) {
    const from = dests[Math.floor(rnd() * dests.length)]!;
    let to = dests[Math.floor(rnd() * dests.length)]!;
    if (to === from) to = dests[(dests.indexOf(from) + 1) % dests.length]!;
    const hex = Array.from({ length: 64 }, () => Math.floor(rnd() * 16).toString(16)).join("");
    out.push({
      id: count - i,
      ts: new Date(t).toISOString(),
      from,
      to,
      amount: Math.round(pool.funds * (0.002 + rnd() * 0.02)),
      reason: REASONS[Math.floor(rnd() * REASONS.length)]!,
      txHash: `0x${hex}`
    });
    t -= Math.round((4 + rnd() * 14) * 3_600_000);
  }
  return out;
}
