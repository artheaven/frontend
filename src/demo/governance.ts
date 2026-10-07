/**
 * DEMO DATA — synthetic role holders and timelock state for the pool page.
 * Roles and limits mirror the deployed Rebalancer (RoleManager + Timelock); addresses and
 * multisig thresholds are placeholders until real deployments exist.
 */
import type { IVaultGovernance } from "@/api/pools/types";

import type { DemoPool } from "./data";

const addr = (n: number) => `0x${n.toString(16).padStart(40, "0")}` as `0x${string}`;

const QUEUED: Record<string, { action: string; hoursFromNow: number }[]> = {
  USDT: [{ action: "Add Euler USDT to the market list", hoursFromNow: 30 }]
};

export function demoGovernance(pool: DemoPool, now = Date.now()): IVaultGovernance {
  const base = parseInt(pool.vaultAddress.slice(-4), 16) * 16;
  return {
    roles: [
      { role: "admin", address: addr(base + 1), kind: "safe", threshold: "3/5" },
      { role: "executor", address: addr(base + 2), kind: "eoa" },
      { role: "curator", address: addr(base + 3), kind: "safe", threshold: "2/3" },
      { role: "watchdog", address: addr(base + 6), kind: "eoa" },
      { role: "recovery", address: addr(base + 7), kind: "safe", threshold: "3/5" },
      { role: "treasury", address: addr(base + 4), kind: "safe", threshold: "2/3" }
    ],
    timelock: { address: addr(base + 5), delaySeconds: 24 * 3_600, gracePeriodSeconds: 14 * 86_400 },
    queued: (QUEUED[pool.token] ?? []).map(q => ({
      action: q.action,
      eta: new Date(now + q.hoursFromNow * 3_600_000).toISOString()
    }))
  };
}
