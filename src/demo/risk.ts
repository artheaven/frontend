/**
 * DEMO DATA — synthetic CRA (Collateral Risk Analyzer) output for the pool page.
 * Timestamps are relative to the request time so the monitor reads like a live feed
 * (a fixed date would make every score stale, and stale scores block allocation).
 * Markets and scores follow the Transparency › Risk mocks on the Invictus site.
 */
import type { IRiskConclusion, IRiskContour, IRiskMarket, IRiskMonitor, RiskAxis, RiskProvenance } from "@/api/pools/types";

import type { DemoPool } from "./data";

const AXES: RiskAxis[] = ["concentration", "collateral_quality", "oracle", "position_health", "liquidation", "liquidity_exit", "governance"];

const prov = (overrides: Partial<Record<RiskAxis, RiskProvenance>> = {}) =>
  ({
    ...Object.fromEntries(AXES.map(a => [a, "measured"])),
    // Governance contour is not live yet — shown with default provenance.
    governance: "default",
    ...overrides
  }) as Record<RiskAxis, RiskProvenance>;

const band = (score: number): IRiskMarket["band"] => (score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D");

// Placeholder curators for demo purposes; direct Morpho Blue markets have none.
const CURATORS: Record<string, string | null> = {
  "MetaMorpho USDC vault A": "Steakhouse Financial",
  "Aave v3 USDC": "Aave DAO",
  "Pool X · rsETH collateral": "Unverified",
  "Aave v3 USDT": "Aave DAO",
  "MetaMorpho USDT vault A": "Gauntlet",
  "Euler USDT": "Re7 Labs",
  "Aave v3 DAI": "Aave DAO",
  "MetaMorpho DAI vault A": "Block Analitica"
};

type Seed = Omit<IRiskMarket, "share" | "computedAt" | "ttlSeconds" | "band" | "candidate" | "provenance" | "curator"> & {
  minutesAgo: number;
  provenance?: Partial<Record<RiskAxis, RiskProvenance>>;
};

interface Scenario {
  markets: Seed[];
  contours: Record<IRiskContour["id"], Omit<IRiskContour, "id">>;
  conclusions: (Omit<IRiskConclusion, "ts"> & { minutesAgo: number })[];
}

const ok = (note = "No signals"): Omit<IRiskContour, "id"> => ({ status: "normal", note });

const SCENARIOS: Record<string, Scenario> = {
  USDC: {
    markets: [
      {
        market: "MetaMorpho USDC vault A",
        protocol: "morpho",
        minutesAgo: 4,
        gatesPassed: true,
        gateFailures: [],
        score: 84,
        maxAllocationPct: 40,
        topCollateral: { symbol: "wstETH", cluster: "ETH LST", weight: 0.46 },
        effectiveN: 4.8,
        anomalySignals: []
      },
      {
        market: "Aave v3 USDC",
        protocol: "aave",
        minutesAgo: 3,
        gatesPassed: true,
        gateFailures: [],
        score: 88,
        maxAllocationPct: 40,
        topCollateral: { symbol: "WETH", cluster: "ETH", weight: 0.31 },
        effectiveN: 7.9,
        anomalySignals: []
      },
      {
        market: "Morpho Blue USDC market B",
        protocol: "morpho",
        minutesAgo: 6,
        gatesPassed: true,
        gateFailures: [],
        score: 71,
        maxAllocationPct: 20,
        topCollateral: { symbol: "cbBTC", cluster: "BTC wrapped", weight: 1 },
        effectiveN: 1,
        anomalySignals: []
      },
      {
        market: "Morpho Blue USDC market C",
        protocol: "morpho",
        minutesAgo: 41,
        gatesPassed: false,
        gateFailures: ["NO_DATA"],
        score: 58,
        maxAllocationPct: 0,
        topCollateral: { symbol: "PT-sUSDe", cluster: "Synthetic dollar PT", weight: 1 },
        effectiveN: 1,
        anomalySignals: [],
        provenance: { liquidation: "default" }
      },
      {
        market: "Pool X · rsETH collateral",
        protocol: "morpho",
        minutesAgo: 1,
        gatesPassed: false,
        gateFailures: ["BRIDGE_SINGLE_POINT_OF_FAILURE", "BEHAVIORAL_ANOMALY"],
        score: 0,
        maxAllocationPct: 0,
        topCollateral: { symbol: "rsETH", cluster: "ETH LRT", weight: 1 },
        effectiveN: 1,
        anomalySignals: ["collateral_inflow_velocity", "new_address_share"]
      }
    ],
    contours: {
      structural: { status: "gate", note: "Single-point-of-failure bridge · Pool X (candidate)" },
      positional: ok(),
      liquidation: ok("Exit quotes within tolerance"),
      behavioural: { status: "gate", note: "Inflow from fresh addresses · Pool X (candidate)" }
    },
    conclusions: [
      {
        minutesAgo: 1,
        market: "Pool X · rsETH collateral",
        severity: "block",
        observed: "Sudden rsETH inflow from fresh addresses; collateral bridged with 1-of-1 verification.",
        action: "Two hard gates failed. Market excluded — the optimizer cannot allocate to it."
      },
      {
        minutesAgo: 41,
        market: "Morpho Blue USDC market C",
        severity: "warn",
        observed: "Liquidation and governance axes have no measured data yet.",
        action: "NO_DATA gate. Stays at 0% until the missing axes are measured."
      },
      {
        minutesAgo: 60 * 9,
        market: "Morpho Blue USDC market B",
        severity: "warn",
        observed: "Utilization above 90%.",
        action: "Circuit breaker: no new supply to this market. Cleared after 45 min once utilization normalised."
      },
      {
        minutesAgo: 60 * 51,
        market: "MetaMorpho USDC vault A",
        severity: "info",
        observed: "wstETH share of collateral rose from 39% to 46%.",
        action: "Score 86 → 84. Still band A; cap unchanged at 40%."
      }
    ]
  },
  USDT: {
    markets: [
      {
        market: "Aave v3 USDT",
        protocol: "aave",
        minutesAgo: 2,
        gatesPassed: true,
        gateFailures: [],
        score: 86,
        maxAllocationPct: 40,
        topCollateral: { symbol: "WETH", cluster: "ETH", weight: 0.33 },
        effectiveN: 7.1,
        anomalySignals: []
      },
      {
        market: "MetaMorpho USDT vault A",
        protocol: "morpho",
        minutesAgo: 5,
        gatesPassed: true,
        gateFailures: [],
        score: 79,
        maxAllocationPct: 20,
        topCollateral: { symbol: "weETH", cluster: "ETH LRT", weight: 0.39 },
        effectiveN: 3.9,
        anomalySignals: ["collateral_inflow_velocity"]
      },
      {
        market: "Morpho Blue USDT market B",
        protocol: "morpho",
        minutesAgo: 7,
        gatesPassed: true,
        gateFailures: [],
        score: 66,
        maxAllocationPct: 20,
        topCollateral: { symbol: "sUSDe", cluster: "Synthetic dollar", weight: 1 },
        effectiveN: 1,
        anomalySignals: []
      },
      {
        market: "Euler USDT",
        protocol: "euler",
        minutesAgo: 9,
        gatesPassed: true,
        gateFailures: [],
        score: 62,
        maxAllocationPct: 20,
        topCollateral: { symbol: "WBTC", cluster: "BTC wrapped", weight: 0.41 },
        effectiveN: 3.2,
        anomalySignals: []
      }
    ],
    contours: {
      structural: ok(),
      positional: ok(),
      liquidation: ok("Exit quotes within tolerance"),
      behavioural: { status: "signal", note: "Collateral inflow velocity · MetaMorpho USDT vault A" }
    },
    conclusions: [
      {
        minutesAgo: 38,
        market: "MetaMorpho USDT vault A",
        severity: "warn",
        observed: "weETH collateral inflow faster than its usual range (behavioural signal, no gate).",
        action: "Score 83 → 79, cap 40% → 20%. Share is being reduced to the cap over the next rebalances, sized to available liquidity."
      },
      {
        minutesAgo: 60 * 3,
        market: "Morpho Blue USDT market B",
        severity: "info",
        observed: "Stress test re-run: exit time 11 h, within the vault SLA.",
        action: "No change. Cap stays at 20%."
      },
      {
        minutesAgo: 60 * 26,
        market: "Euler USDT",
        severity: "info",
        observed: "New candidate passed all eight hard gates; score 62.",
        action: "Eligible up to 20%. Not selected — the optimizer finds better marginal rates elsewhere."
      }
    ]
  },
  DAI: {
    markets: [
      {
        market: "Aave v3 DAI",
        protocol: "aave",
        minutesAgo: 3,
        gatesPassed: true,
        gateFailures: [],
        score: 87,
        maxAllocationPct: 40,
        topCollateral: { symbol: "WETH", cluster: "ETH", weight: 0.35 },
        effectiveN: 6.6,
        anomalySignals: []
      },
      {
        market: "MetaMorpho DAI vault A",
        protocol: "morpho",
        minutesAgo: 5,
        gatesPassed: true,
        gateFailures: [],
        score: 82,
        maxAllocationPct: 40,
        topCollateral: { symbol: "wstETH", cluster: "ETH LST", weight: 0.42 },
        effectiveN: 4.4,
        anomalySignals: []
      },
      {
        market: "Morpho Blue DAI market B",
        protocol: "morpho",
        minutesAgo: 8,
        gatesPassed: true,
        gateFailures: [],
        score: 54,
        maxAllocationPct: 10,
        topCollateral: { symbol: "sUSDe", cluster: "Synthetic dollar", weight: 1 },
        effectiveN: 1,
        anomalySignals: []
      }
    ],
    contours: {
      structural: ok(),
      positional: ok(),
      liquidation: ok("Exit quotes within tolerance"),
      behavioural: ok()
    },
    conclusions: [
      {
        minutesAgo: 60 * 6,
        market: "MetaMorpho DAI vault A",
        severity: "info",
        observed: "sDAI oracle update delayed by 3 min; recovered within tolerance.",
        action: "No action. Logged for the oracle-quality axis."
      },
      {
        minutesAgo: 60 * 30,
        market: "Morpho Blue DAI market B",
        severity: "info",
        observed: "Single-collateral market; exit time under stress close to the SLA.",
        action: "Score 54, band C — eligible up to 10%. Not selected."
      }
    ]
  }
};

/** CRA snapshot for a demo pool. Current shares come from the pool's allocations. */
export function demoRiskMonitor(pool: DemoPool, now = Date.now()): IRiskMonitor {
  const scenario = SCENARIOS[pool.token] ?? SCENARIOS.USDC!;
  const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
  const shareOf = (market: string) => pool.allocations.find(a => a.destination === market)?.share ?? 0;

  const markets: IRiskMarket[] = scenario.markets.map(({ minutesAgo, provenance, ...m }) => {
    const share = shareOf(m.market);
    return {
      ...m,
      curator: CURATORS[m.market] ?? null,
      share,
      candidate: share === 0,
      computedAt: iso(minutesAgo),
      ttlSeconds: 900,
      band: band(m.score ?? 0),
      provenance: prov(provenance)
    };
  });

  // Routine cycles every 15 min fill the log between conclusions, as a real feed would.
  const taken = scenario.conclusions.map(c => c.minutesAgo);
  const routine = Array.from({ length: 10 }, (_, i) => 2 + i * 15)
    .filter(m => taken.every(t => Math.abs(t - m) > 6))
    .map(m => ({
      minutesAgo: m,
      market: "All markets",
      severity: "ok" as const,
      observed: `Assessment cycle: ${scenario.markets.length} markets scored, gates re-checked.`,
      action: "No changes."
    }));
  const log = [...scenario.conclusions, ...routine].sort((a, b) => a.minutesAgo - b.minutesAgo);

  return {
    computedAt: iso(Math.min(...scenario.markets.map(m => m.minutesAgo))),
    contours: (Object.entries(scenario.contours) as [IRiskContour["id"], Omit<IRiskContour, "id">][]).map(([id, c]) => ({ id, ...c })),
    markets,
    conclusions: log.map(({ minutesAgo, ...c }) => ({ ...c, ts: iso(minutesAgo) }))
  };
}
