"use client";
import { Box, Collapse, Flex, Grid, Skeleton, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import { getRiskMonitor } from "@/api/pools/queries";
import { IPoolData, IRiskConclusion, IRiskContour, IRiskMarket, IRiskMonitor, RiskAxis } from "@/api/pools/types";
import { StatusPill } from "@/components/status-pill";
import { DEMO_MODE } from "@/demo/config";
import { useStore } from "@/hooks/useStoreContext";

/**
 * Pool page: what the Collateral Risk Analyzer watches for this vault and what it concluded.
 * Shows only fields inside the public disclosure boundary — no axis weights, thresholds or raw values.
 */

const CONTOURS: Record<IRiskContour["id"], { name: string; watches: string; every: string }> = {
  structural: { name: "Structural", watches: "Concentration, oracles, bridges, redemption", every: "5 min" },
  positional: { name: "Positional", watches: "Health-factor buckets, stress S1–S4", every: "15 min" },
  liquidation: { name: "Liquidation feasibility", watches: "Live exit quotes vs liquidation bonus", every: "1 h" },
  behavioural: { name: "Behavioural", watches: "Inflow velocity, new addresses, peg, backing", every: "1–5 min" }
};

const GATES: { code: string; name: string }[] = [
  { code: "MARKET_FROZEN", name: "Market frozen or paused" },
  { code: "CLUSTER_CONCENTRATION", name: "Cluster concentration with thin liquidation" },
  { code: "LIQUIDATION_INFEASIBLE", name: "Liquidation not economically executable" },
  { code: "ORACLE_EXCHANGE_RATE", name: "Exchange-rate oracle on a non-redeemable asset" },
  { code: "BEHAVIORAL_ANOMALY", name: "Behavioural contour signal" },
  { code: "EXIT_TIME_SLA", name: "Stress exit time exceeds the vault SLA" },
  { code: "BRIDGE_SINGLE_POINT_OF_FAILURE", name: "Single-point-of-failure bridge" },
  { code: "MANUAL_BLOCKLIST", name: "Manual block list" }
];
const gateName = (code: string) =>
  code === "NO_DATA" ? "Insufficient measured data" : (GATES.find(g => g.code === code)?.name ?? code);

const AXES: { key: RiskAxis; name: string }[] = [
  { key: "concentration", name: "Concentration" },
  { key: "collateral_quality", name: "Collateral quality" },
  { key: "oracle", name: "Oracle" },
  { key: "position_health", name: "Position health" },
  { key: "liquidation", name: "Liquidation" },
  { key: "liquidity_exit", name: "Liquidity exit" },
  { key: "governance", name: "Governance" }
];

const PROTOCOL_NAMES: Record<string, string> = {
  aave: "Aave v3",
  morpho: "Morpho",
  euler: "Euler",
  compound: "Compound v3",
  fluid: "Fluid"
};

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(var(--inv-pos-rgb), 0.55); }
  70% { box-shadow: 0 0 0 6px rgba(var(--inv-pos-rgb), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--inv-pos-rgb), 0); }
`;

const ago = (iso: string, now: number) => {
  const m = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};

const pct = (share: number) => `${Math.round(share * 100)}%`;
const isStale = (m: IRiskMarket, now: number) => now - Date.parse(m.computedAt) > m.ttlSeconds * 1000;

type Tone = "pos" | "warn" | "neg" | "ink3";

function verdict(m: IRiskMarket, now: number): { label: string; tone: Tone; why: string } {
  if (!m.gatesPassed) {
    return { label: "Excluded", tone: "neg", why: `Hard gate: ${m.gateFailures.map(gateName).join(", ")}. Allocation is zero.` };
  }
  if (isStale(m, now)) {
    return { label: "Excluded", tone: "neg", why: "No fresh score within its TTL. Allocation is blocked until the next assessment (fail-closed)." };
  }
  if (m.share * 100 > m.maxAllocationPct + 0.5) {
    return {
      label: "Reducing",
      tone: "warn",
      why: `Share ${pct(m.share)} is above the ${m.maxAllocationPct}% cap. Excess is moved out over the next rebalances, sized to available liquidity.`
    };
  }
  if (m.candidate) {
    return {
      label: "Eligible",
      tone: "ink3",
      why: `Passes all hard gates, eligible up to ${m.maxAllocationPct}%. Not in use — the optimizer decides whether it improves the vault's yield.`
    };
  }
  return { label: "Within cap", tone: "pos", why: `Passes all hard gates. Share ${pct(m.share)} is within the ${m.maxAllocationPct}% cap.` };
}

const TONE_COLOR: Record<Tone, string> = { pos: "pos", warn: "warn", neg: "neg", ink3: "ink3" };

// ---------------------------------------------------------------------------

const Eyebrow = ({ children, mt = "28px" }: { children: React.ReactNode; mt?: string }) => (
  <Text textStyle="eyebrow" mt={mt} mb="12px">
    {children}
  </Text>
);

const Dot = ({ tone, live }: { tone: Tone; live?: boolean }) => (
  <Box
    as="span"
    display="inline-block"
    w="6px"
    h="6px"
    borderRadius="50%"
    bg={TONE_COLOR[tone]}
    flexShrink={0}
    animation={live ? `${pulse} 2s ease-out infinite` : undefined}
  />
);

const Contours = ({ contours }: { contours: IRiskContour[] }) => (
  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap="1px" bg="line" border="1px solid" borderColor="line">
    {contours.map(c => {
      const meta = CONTOURS[c.id];
      const tone: Tone = c.status === "gate" ? "neg" : c.status === "signal" ? "warn" : "pos";
      return (
        <Flex key={c.id} direction="column" gap="6px" bg="bg" p="14px" minW={0}>
          <Flex justify="space-between" align="baseline" gap="8px">
            <Text fontSize="sm" color="ink">
              {meta.name}
            </Text>
            <Text fontFamily="mono" fontSize="10px" color="ink3" whiteSpace="nowrap">
              every {meta.every}
            </Text>
          </Flex>
          <Text fontSize="xs" color="ink3">
            {meta.watches}
          </Text>
          <Flex align="center" gap="8px" mt="auto" pt="4px">
            <Dot tone={tone} />
            <Text fontFamily="mono" fontSize="11px" color={tone === "pos" ? "ink2" : TONE_COLOR[tone]} noOfLines={2}>
              {c.note}
            </Text>
          </Flex>
        </Flex>
      );
    })}
  </Grid>
);

/** Share of funds against the ladder cap, on a 0–40% scale (the top ladder step). */
const CapBar = ({ share, cap }: { share: number; cap: number }) => {
  const over = share * 100 > cap + 0.5;
  return (
    <Flex direction="column" gap="4px" w="100%">
      <Text fontFamily="mono" fontSize="12px" color="ink" whiteSpace="nowrap">
        {pct(share)} <Text as="span" color="ink3">/ {cap}%</Text>
      </Text>
      <Box position="relative" h="4px" bg="bg3" aria-hidden>
        <Box h="100%" w={`${Math.min(1, share / 0.4) * 100}%`} bg={over ? "warn" : "accent"} />
        <Box position="absolute" top="-3px" bottom="-3px" left={`calc(${(cap / 40) * 100}% - 1px)`} w="2px" bg="ink" />
      </Box>
    </Flex>
  );
};

const GateTicks = ({ m }: { m: IRiskMarket }) => {
  const noData = m.gateFailures.includes("NO_DATA");
  const passed = GATES.filter(g => !m.gateFailures.includes(g.code)).length;
  return (
    <Flex direction="column" gap="4px">
      <Text fontFamily="mono" fontSize="12px" color={m.gatesPassed ? "ink" : "neg"} whiteSpace="nowrap">
        {noData ? "No data" : `${passed}/${GATES.length}`}
      </Text>
      <Flex gap="2px" aria-hidden>
        {GATES.map(g => (
          <Box key={g.code} w="6px" h="6px" bg={noData ? "lineStrong" : m.gateFailures.includes(g.code) ? "neg" : "pos"} opacity={noData ? 1 : 0.9} />
        ))}
      </Flex>
    </Flex>
  );
};

const MarketDetail = ({ m, why }: { m: IRiskMarket; why: string }) => (
  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="20px" pt="4px" pb="18px">
    <Flex direction="column" gap="10px">
      <Text fontSize="sm" color="ink2">
        {why}
      </Text>
      <Grid templateColumns="repeat(2, auto)" justifyContent="start" columnGap="24px" rowGap="2px">
        <Text textStyle="eyebrow">Top collateral</Text>
        <Text textStyle="eyebrow">Effective N</Text>
        <Text fontFamily="mono" fontSize="12px" color="ink">
          {m.topCollateral.symbol} <Text as="span" color="ink3">{pct(m.topCollateral.weight)} · {m.topCollateral.cluster}</Text>
        </Text>
        <Text fontFamily="mono" fontSize="12px" color="ink">
          {m.effectiveN.toFixed(1)}
        </Text>
      </Grid>
      {m.anomalySignals.length > 0 ? (
        <Text fontFamily="mono" fontSize="11px" color="warn">
          Signals: {m.anomalySignals.join(", ").replace(/_/g, " ")}
        </Text>
      ) : null}
      <Box>
        <Text textStyle="eyebrow" mb="6px">
          Data per axis
        </Text>
        <Flex wrap="wrap" gap="4px">
          {AXES.map(a => {
            const p = m.provenance[a.key];
            return (
              <Text
                key={a.key}
                as="span"
                title={p === "measured" ? "Measured" : p === "default" ? "Default value — not measured yet" : "Not applicable"}
                fontFamily="mono"
                fontSize="10px"
                px="5px"
                py="2px"
                border="1px solid"
                borderColor={p === "measured" ? "lineStrong" : "warn"}
                color={p === "measured" ? "ink2" : "warn"}
                borderStyle={p === "measured" ? "solid" : "dashed"}
              >
                {a.name}
              </Text>
            );
          })}
        </Flex>
      </Box>
    </Flex>
    <Box>
      <Text textStyle="eyebrow" mb="6px">
        Hard gates
      </Text>
      {m.gateFailures.includes("NO_DATA") ? (
        <Text fontSize="xs" color="neg" mb="6px">
          Not enough measured data to evaluate the gates.
        </Text>
      ) : null}
      <Flex direction="column" gap="3px">
        {GATES.map(g => {
          const failed = m.gateFailures.includes(g.code);
          return (
            <Flex key={g.code} align="center" gap="8px">
              <Text as="span" fontFamily="mono" fontSize="11px" w="12px" color={failed ? "neg" : "pos"}>
                {failed ? "✕" : "✓"}
              </Text>
              <Text fontSize="xs" color={failed ? "ink" : "ink3"}>
                {g.name}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  </Grid>
);

const COLS = { base: "minmax(0,1fr) auto", md: "minmax(0,1fr) 56px 92px 128px 104px 14px" };

const MarketRow = ({ m, now }: { m: IRiskMarket; now: number }) => {
  const [open, setOpen] = useState(false);
  const v = verdict(m, now);
  return (
    <Box borderTop="1px solid" borderColor="line">
      <Grid
        as="button"
        type="button"
        w="100%"
        textAlign="left"
        templateColumns={COLS}
        columnGap="16px"
        rowGap="8px"
        alignItems="center"
        py="12px"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        _hover={{ "& .risk-name": { color: "accent" } }}
      >
        <Box minW={0}>
          <Text className="risk-name" fontSize="sm" color="ink" noOfLines={1} transition="color 120ms">
            {m.market}
          </Text>
          <Text fontSize="xs" color="ink3" noOfLines={1}>
            {PROTOCOL_NAMES[m.protocol] ?? m.protocol}
            {m.candidate ? " · candidate" : ""} · assessed {ago(m.computedAt, now)}
          </Text>
        </Box>
        <Box display={{ base: "none", md: "block" }}>
          <Text fontFamily="mono" fontSize="16px" color={m.gatesPassed ? "ink" : "ink3"} lineHeight="1.1">
            {m.gatesPassed ? m.score : "—"}
          </Text>
          <Text fontFamily="mono" fontSize="10px" color="ink3">
            band {m.gatesPassed ? m.band : "—"}
          </Text>
        </Box>
        <Box display={{ base: "none", md: "block" }}>
          <GateTicks m={m} />
        </Box>
        <Box display={{ base: "none", md: "block" }}>
          <CapBar share={m.share} cap={m.maxAllocationPct} />
        </Box>
        <Flex align="center" gap="8px" justify={{ base: "flex-end", md: "flex-start" }}>
          <Dot tone={v.tone} />
          <Text fontFamily="mono" fontSize="11px" letterSpacing="0.08em" textTransform="uppercase" color={TONE_COLOR[v.tone]} whiteSpace="nowrap">
            {v.label}
          </Text>
        </Flex>
        <Text display={{ base: "none", md: "block" }} color="ink3" fontSize="12px" transform={open ? "rotate(90deg)" : undefined} transition="transform 120ms">
          ›
        </Text>
        {/* Mobile: the numbers on a second line */}
        <Flex display={{ base: "flex", md: "none" }} gridColumn="1 / -1" gap="20px" fontFamily="mono" fontSize="11px" color="ink3">
          <Text>
            score <Text as="span" color="ink">{m.gatesPassed ? m.score : "—"}</Text>
          </Text>
          <Text>
            gates <Text as="span" color={m.gatesPassed ? "ink" : "neg"}>{m.gatesPassed ? "8/8" : "failed"}</Text>
          </Text>
          <Text>
            share <Text as="span" color="ink">{pct(m.share)}</Text> / cap {m.maxAllocationPct}%
          </Text>
        </Flex>
      </Grid>
      <Collapse in={open} animateOpacity>
        <MarketDetail m={m} why={v.why} />
      </Collapse>
    </Box>
  );
};

const Markets = ({ markets, now }: { markets: IRiskMarket[]; now: number }) => {
  // Allocated markets first (by share), then candidates.
  const rows = [...markets].sort((a, b) => Number(a.candidate) - Number(b.candidate) || b.share - a.share);
  return (
    <Box>
      <Grid display={{ base: "none", md: "grid" }} templateColumns={COLS} columnGap="16px" pb="8px">
        <Text textStyle="eyebrow">Market</Text>
        <Text textStyle="eyebrow">Score</Text>
        <Text textStyle="eyebrow">Gates</Text>
        <Text textStyle="eyebrow">Share / cap</Text>
        <Text textStyle="eyebrow">Status</Text>
        <span />
      </Grid>
      {rows.map(m => (
        <MarketRow key={m.market} m={m} now={now} />
      ))}
    </Box>
  );
};

const SEVERITY_TONE: Record<IRiskConclusion["severity"], Tone> = { info: "ink3", warn: "warn", block: "neg" };

const Conclusions = ({ items, now }: { items: IRiskConclusion[]; now: number }) => {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, 3);
  return (
    <Box>
      {shown.map(c => (
        <Grid
          key={`${c.ts}-${c.market}`}
          templateColumns={{ base: "1fr", md: "96px minmax(0,1fr)" }}
          columnGap="16px"
          rowGap="4px"
          py="12px"
          borderTop="1px solid"
          borderColor="line"
        >
          <Flex align="center" gap="8px" h={{ md: "20px" }}>
            <Dot tone={SEVERITY_TONE[c.severity]} />
            <Text fontFamily="mono" fontSize="11px" color="ink3" whiteSpace="nowrap">
              {ago(c.ts, now)}
            </Text>
          </Flex>
          <Box minW={0}>
            <Text fontSize="sm" color="ink">
              {c.market}
            </Text>
            <Text fontSize="sm" color="ink3">
              {c.observed}
            </Text>
            <Text fontSize="sm" color="ink2" mt="2px">
              <Text as="span" color={c.severity === "info" ? "accent" : TONE_COLOR[SEVERITY_TONE[c.severity]]} mr="6px">
                →
              </Text>
              {c.action}
            </Text>
          </Box>
        </Grid>
      ))}
      {items.length > 3 ? (
        <Box
          as="button"
          type="button"
          onClick={() => setAll(a => !a)}
          mt="8px"
          fontFamily="mono"
          fontSize="11px"
          letterSpacing="0.12em"
          textTransform="uppercase"
          color="ink3"
          _hover={{ color: "ink" }}
        >
          {all ? "Show fewer" : `Show all ${items.length}`}
        </Box>
      ) : null}
    </Box>
  );
};

function summary(markets: IRiskMarket[], now: number): string {
  const allocated = markets.filter(m => !m.candidate);
  const candidates = markets.filter(m => m.candidate);
  const clean = allocated.every(m => m.gatesPassed && !isStale(m, now));
  const over = allocated.filter(m => m.share * 100 > m.maxAllocationPct + 0.5);
  const excluded = candidates.filter(m => verdict(m, now).tone === "neg");
  const parts = [
    clean
      ? `All ${allocated.length} markets in use pass every hard gate`
      : `${allocated.filter(m => verdict(m, now).tone === "neg").length} market in use failed a check and is being exited`,
    over.length
      ? `${over.length} is above its cap and being reduced`
      : "every share is within its cap"
  ];
  let s = `${parts[0]}; ${parts[1]}.`;
  if (candidates.length) {
    s += ` ${candidates.length} candidate ${candidates.length === 1 ? "market is" : "markets are"} monitored${excluded.length ? `, ${excluded.length} excluded` : ""}.`;
  }
  return s;
}

// ---------------------------------------------------------------------------

export const RiskMonitor = observer(({ pool }: { pool: IPoolData }) => {
  const { activeChain } = useStore("poolsStore");
  const [data, setData] = useState<IRiskMonitor | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    getRiskMonitor(pool.token, activeChain as never)
      .then(res => {
        if (cancelled) return;
        setData(res);
        setState("ready");
      })
      .catch(() => !cancelled && setState("unavailable"));
    return () => {
      cancelled = true;
    };
  }, [pool.token, activeChain]);

  // Keep "n min ago" and staleness honest while the page stays open.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <Flex direction="column" w="100%">
      <Flex mt="48px" mb="12px" justify="space-between" align="center" gap="12px" wrap="wrap">
        <Text textStyle="h2">Risk monitoring</Text>
        {data ? (
          <Flex align="center" gap="8px">
            <Dot tone="pos" live />
            <Text fontFamily="mono" fontSize="11px" color="ink3">
              Last assessment {ago(data.computedAt, now)}
            </Text>
          </Flex>
        ) : null}
      </Flex>
      <Box bg="bg2" borderWidth="1px" borderStyle="solid" borderColor="line" borderRadius="2px" p={{ base: "16px", md: "24px" }}>
        {state === "unavailable" ? (
          <Flex minH="160px" align="center" justify="center">
            <Text fontSize="sm" color="ink3">
              Risk assessment is not available for this vault yet.
            </Text>
          </Flex>
        ) : !data ? (
          <Flex direction="column" gap="10px">
            <Skeleton h="20px" w="70%" />
            <Skeleton h="96px" />
            <Skeleton h="180px" />
          </Flex>
        ) : (
          <>
            <Text fontSize="md" color="ink" maxW="720px">
              {summary(data.markets, now)}
            </Text>
            <Text fontSize="sm" color="ink3" mt="6px" maxW="720px">
              The Collateral Risk Analyzer checks the collateral behind every market the vault uses or considers. Its caps and
              exclusions are hard limits for the allocation optimizer.
            </Text>

            <Eyebrow>What is monitored</Eyebrow>
            <Contours contours={data.contours} />

            <Eyebrow>Markets · select a row for details</Eyebrow>
            <Markets markets={data.markets} now={now} />

            <Eyebrow>Latest conclusions</Eyebrow>
            <Conclusions items={data.conclusions} now={now} />

            <Flex mt="16px" pt="12px" borderTop="1px solid" borderColor="line" align="center" gap="8px" wrap="wrap">
              <Text fontFamily="mono" fontSize="11px" color="ink3">
                A market without a fresh score gets zero allocation. Axis weights and thresholds are not published.
              </Text>
              {DEMO_MODE ? <StatusPill kind="DEMO DATA" /> : null}
            </Flex>
          </>
        )}
      </Box>
    </Flex>
  );
});
