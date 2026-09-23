/**
 * In demo mode, requests to the backend are answered locally from src/demo/data.ts.
 * Outside demo mode `apiFetch` is plain `fetch`.
 */
import { DEMO_MODE } from "./config";
import { demoLedger } from "./ledger";
import { DEMO_POOLS, DemoPool, demoEarnedTicks, demoRebalances, demoTicks, findDemoPool } from "./data";

const json = (data: unknown) =>
  new Response(JSON.stringify(data), { status: 200, headers: { "content-type": "application/json" } });

/** Earned over `days` for a pool position, USD. */
/** Pools with the demo wallet's current position (the ledger) instead of the seed value. */
const livePools = (): DemoPool[] =>
  DEMO_POOLS.map(p => ({ ...p, demoDeposit: demoLedger.position(p.vaultAddress), funds: p.funds + demoLedger.positionDelta(p.vaultAddress) }));

const earnedOver = (p: DemoPool, days: number) =>
  (p.demoDeposit * p.tokenPrice * p.avgApr30D * days) / 36_500;

export function demoRoute(url: URL): Response {
  const p = url.pathname.split("/").filter(Boolean);
  const [type, a, b, c, d, e] = p;
  const pools = livePools();
  const pool = pools.find(x => x.token === findDemoPool(a)?.token) ?? pools[0]!;

  // /{lending|borrowing}?network=
  if (p.length === 1 && (type === "lending" || type === "borrowing")) {
    return json(pools.map(({ demoDeposit, ...rest }) => rest));
  }
  // /{type}/user-earned-overall/{address}
  if (a === "user-earned-overall") return json(pools.reduce((s, x) => s + earnedOver(x, 120), 0));
  // /{type}/{token}/user-earned/{address}
  if (b === "user-earned") return json(earnedOver(pool, 120));
  // /lending/highest-apr-token/{days}
  if (a === "highest-apr-token") return new Response(DEMO_POOLS[0]!.token.toLowerCase());
  // /lending/{token}/rebalances?page=&limit=
  if (b === "rebalances") {
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 5)));
    const all = demoRebalances(pool);
    return json({ items: all.slice((page - 1) * limit, page * limit), total: all.length });
  }
  // /lending/{token}/apr-ticks/{interval}/{count}
  if (b === "apr-ticks") return json(demoTicks(pool.token, +c!, +d!, pool.avgApr30D, 1.2));
  // /lending/{token}/highest-market-apr-ticks/{interval}/{count}
  // Market series = vault series minus the published spread, plus noise, so both stay consistent.
  if (b === "highest-market-apr-ticks") {
    const own = demoTicks(pool.token, +c!, +d!, pool.avgApr30D, 1.2);
    const noise = demoTicks(`${pool.token}:market`, +c!, +d!, 0.3, 0.6); // mean 0.3, re-centred below
    return json(
      own.map((t, i) => ({
        ...t,
        value: Number(Math.max(0, (t.value ?? 0) - pool.highestMarket30DAvgAprDiffPercentage + (noise[i]!.value ?? 0) - 0.3).toFixed(3))
      }))
    );
  }
  // /lending/user-earned-overall-ticks/{address}/{interval}/{count}
  if (a === "user-earned-overall-ticks") return json(demoEarnedTicks(pools, +c!, +d!));
  // /lending/{token}/user-earned-ticks/{address}/{interval}/{count}
  if (b === "user-earned-ticks") return json(demoEarnedTicks([pool], +d!, +e!));
  // points & rewards: empty but well-formed
  if (a === "user-points" || a === "calculate-points") return json(0);
  if (a === "user-tasks" || a === "user-locks") return json([]);
  if (a === "complete-task") return json({ ok: true });
  if (a === "rewards-claim-details") return json({ claimable: null });

  return new Response(JSON.stringify({ error: "not available in demo mode", path: url.pathname }), { status: 404 });
}

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  if (!DEMO_MODE) return fetch(input, init);
  await new Promise(r => setTimeout(r, 250)); // keep loading states visible
  return demoRoute(new URL(input, "http://demo.local"));
}
