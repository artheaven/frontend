"use client";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Collapse,
  Flex,
  Grid,
  Skeleton,
  Text
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import { getRiskMonitor } from "@/api/pools/queries";
import { IPoolData, IRiskConclusion, IRiskContour, IRiskMarket, IRiskMonitor, RiskAxis } from "@/api/pools/types";
import { StatusPill } from "@/components/status-pill";
import { DEMO_MODE } from "@/demo/config";
import { useStore } from "@/hooks/useStoreContext";

/**
 * Pool page: what the Collateral Risk Analyzer concluded for this vault, the markets it scores,
 * and — collapsed at the bottom — what it watches. Only fields inside the public disclosure
 * boundary: no axis weights, thresholds or raw values.
 */

const CONTOURS: Record<IRiskContour["id"], { name: string; every: string; body: string }> = {
  structural: {
    name: "Structural",
    every: "5 min",
    body: "Concentration by market, asset and cluster of correlated assets; oracle quality; asset profile — bridge, redemption, proof of reserve; market parameters."
  },
  positional: {
    name: "Positional",
    every: "15 min",
    body: "Distribution of debt across health-factor buckets and stress scenarios S1–S4, through both the credit and the liquidity channel."
  },
  liquidation: {
    name: "Liquidation feasibility",
    every: "1 h",
    body: "Whether liquidating a position at size is profitable: liquidation bonus against the price impact of a live aggregator quote."
  },
  behavioural: {
    name: "Behavioural",
    every: "1–5 min",
    body: "Collateral inflow velocity, share of new addresses and of a single address, backing gap, oracle staleness, peg deviation."
  }
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
const NO_DATA = { code: "NO_DATA", name: "Insufficient measured data" };
const gateName = (code: string) => [...GATES, NO_DATA].find(g => g.code === code)?.name ?? code;

const AXES: { key: RiskAxis; name: string; short: string }[] = [
  { key: "concentration", name: "Concentration", short: "Conc." },
  { key: "collateral_quality", name: "Collateral quality", short: "Coll." },
  { key: "oracle", name: "Oracle", short: "Oracle" },
  { key: "position_health", name: "Position health", short: "Pos." },
  { key: "liquidation", name: "Liquidation", short: "Liq." },
  { key: "liquidity_exit", name: "Liquidity exit", short: "Exit" },
  { key: "governance", name: "Governance", short: "Gov." }
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
/** Log timestamp: "09-28 14:02" UTC. */
const stamp = (iso: string) => new Date(iso).toISOString().slice(5, 16).replace("T", " ");

const pct = (share: number) => `${Math.round(share * 100)}%`;
const isStale = (m: IRiskMarket, now: number) => now - Date.parse(m.computedAt) > m.ttlSeconds * 1000;

type Tone = "pos" | "warn" | "neg" | "ink3";

type State = "in_use" | "reducing" | "candidate" | "excluded";

function marketState(m: IRiskMarket, now: number): { state: State; why: string } {
  if (!m.gatesPassed) return { state: "excluded", why: `Hard gate: ${m.gateFailures.map(gateName).join(", ")}. Allocation is zero.` };
  if (isStale(m, now)) {
    return { state: "excluded", why: "No fresh score within its TTL. Allocation is blocked until the next assessment (fail-closed)." };
  }
  if (m.share * 100 > m.maxAllocationPct + 0.5) {
    return {
      state: "reducing",
      why: `Share ${pct(m.share)} is above the ${m.maxAllocationPct}% cap. The excess is moved out over the next rebalances, sized to available liquidity.`
    };
  }
  if (m.candidate) {
    return {
      state: "candidate",
      why: `Passes all hard gates, eligible up to ${m.maxAllocationPct}%. Not in use — the optimizer decides whether it improves the vault's yield.`
    };
  }
  return { state: "in_use", why: `Passes all hard gates. Share ${pct(m.share)} is within the ${m.maxAllocationPct}% cap.` };
}

const STATE_TAG: Record<State, { label: string; color: string } | null> = {
  in_use: null,
  reducing: { label: "Reducing", color: "warn" },
  candidate: { label: "Candidate", color: "ink3" },
  excluded: { label: "Excluded", color: "neg" }
};

// ---------------------------------------------------------------------------

const Dot = ({ tone, live }: { tone: Tone; live?: boolean }) => (
  <Box
    as="span"
    display="inline-block"
    w="6px"
    h="6px"
    borderRadius="50%"
    bg={tone}
    flexShrink={0}
    animation={live ? `${pulse} 2s ease-out infinite` : undefined}
  />
);

const Panel = ({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) => (
  <Flex direction="column" bg="bg" border="1px solid" borderColor="line" minW={0}>
    <Flex justify="space-between" align="center" gap="8px" px="14px" py="9px" borderBottom="1px solid" borderColor="line">
      <Text fontFamily="mono" fontSize="11px" color="ink3" letterSpacing="0.06em">
        {title}
      </Text>
      {right}
    </Flex>
    {children}
  </Flex>
);

const LEVEL: Record<IRiskConclusion["severity"], { label: string; color: string }> = {
  ok: { label: "OK", color: "ink3" },
  info: { label: "INFO", color: "accent" },
  warn: { label: "WARN", color: "warn" },
  block: { label: "BLOCK", color: "neg" }
};

/** Newest-first CRA decision log, styled as a terminal feed. */
const DecisionLog = ({ items }: { items: IRiskConclusion[] }) => (
  <Panel
    title="cra / decisions.log"
    right={
      <Flex align="center" gap="6px">
        <Dot tone="pos" live />
        <Text fontFamily="mono" fontSize="10px" color="ink3" letterSpacing="0.12em">
          LIVE
        </Text>
      </Flex>
    }
  >
    <Box maxH="300px" overflowY="auto" px="14px" py="6px" fontFamily="mono" fontSize="12px" lineHeight="1.55">
      {items.map(c => {
        const lvl = LEVEL[c.severity];
        const routine = c.severity === "ok";
        return (
          <Grid
            key={`${c.ts}-${c.market}`}
            templateColumns={{ base: "auto 44px minmax(0,1fr)", md: "92px 44px minmax(0,1fr)" }}
            columnGap="10px"
            py="6px"
            borderBottom="1px dashed"
            borderColor="line"
            _last={{ borderBottom: "none" }}
            opacity={routine ? 0.7 : 1}
          >
            <Text color="ink3" whiteSpace="nowrap">
              {stamp(c.ts)}
            </Text>
            <Text color={lvl.color}>{lvl.label}</Text>
            <Text color={routine ? "ink3" : "ink"} noOfLines={1}>
              {c.market}
            </Text>
            <Box gridColumn={{ base: "1 / -1", md: "3" }} color="ink3" fontSize="11.5px">
              {c.observed}{" "}
              <Text as="span" color={routine ? "ink3" : lvl.color === "ink3" ? "ink2" : lvl.color}>
                →
              </Text>{" "}
              <Text as="span" color={routine ? "ink3" : "ink2"}>
                {c.action}
              </Text>
            </Box>
          </Grid>
        );
      })}
    </Box>
  </Panel>
);

const CONTOUR_STATUS: Record<IRiskContour["status"], { label: string; tone: Tone }> = {
  normal: { label: "Normal", tone: "pos" },
  signal: { label: "Signal", tone: "warn" },
  gate: { label: "Gate", tone: "neg" }
};

/** Current state of the four contours — the only place their status is shown. */
const ContourStatus = ({ contours }: { contours: IRiskContour[] }) => (
  <Panel title="contours / status">
    <Flex direction="column" px="14px" py="4px">
      {contours.map(c => {
        const s = CONTOUR_STATUS[c.status];
        return (
          <Box key={c.id} py="9px" borderBottom="1px solid" borderColor="line" _last={{ borderBottom: "none" }}>
            <Flex justify="space-between" align="center" gap="8px">
              <Text fontSize="sm" color="ink">
                {CONTOURS[c.id].name}
              </Text>
              <Flex align="center" gap="6px">
                <Dot tone={s.tone} />
                <Text fontFamily="mono" fontSize="10px" letterSpacing="0.1em" textTransform="uppercase" color={s.tone === "pos" ? "ink3" : s.tone}>
                  {s.label}
                </Text>
              </Flex>
            </Flex>
            {c.status !== "normal" ? (
              <Text fontSize="xs" color="ink3" mt="2px">
                {c.note}
              </Text>
            ) : null}
          </Box>
        );
      })}
    </Flex>
  </Panel>
);

/** Share of funds against the ladder cap, on a 0–40% scale (the top ladder step). */
const CapBar = ({ share, cap }: { share: number; cap: number }) => {
  const over = share * 100 > cap + 0.5;
  return (
    <Flex direction="column" gap="4px" w="100%">
      <Text fontFamily="mono" fontSize="12px" color="ink" whiteSpace="nowrap">
        {pct(share)}{" "}
        <Text as="span" color="ink3">
          / {cap}%
        </Text>
      </Text>
      <Box position="relative" h="4px" bg="bg3" aria-hidden>
        <Box h="100%" w={`${Math.min(1, share / 0.4) * 100}%`} bg={over ? "warn" : "accent"} />
        <Box position="absolute" top="-3px" bottom="-3px" left={`calc(${(cap / 40) * 100}% - 1px)`} w="2px" bg="ink" />
      </Box>
    </Flex>
  );
};

const GateTicks = ({ m }: { m: IRiskMarket }) => {
  const noData = m.gateFailures.includes(NO_DATA.code);
  const passed = GATES.filter(g => !m.gateFailures.includes(g.code)).length;
  return (
    <Flex direction="column" gap="4px" title={m.gatesPassed ? "All hard gates passed" : m.gateFailures.map(gateName).join(", ")}>
      <Text fontFamily="mono" fontSize="12px" color={m.gatesPassed ? "ink" : "neg"} whiteSpace="nowrap">
        {noData ? "No data" : `${passed}/${GATES.length}`}
      </Text>
      <Flex gap="2px" aria-hidden>
        {GATES.map(g => (
          <Box key={g.code} w="6px" h="6px" bg={noData ? "lineStrong" : m.gateFailures.includes(g.code) ? "neg" : "pos"} />
        ))}
      </Flex>
    </Flex>
  );
};

const Kv = ({ k, children }: { k: string; children: React.ReactNode }) => (
  <Box>
    <Text textStyle="eyebrow" mb="2px">
      {k}
    </Text>
    <Text fontFamily="mono" fontSize="12px" color="ink">
      {children}
    </Text>
  </Box>
);

const COLS = { base: "minmax(0,1fr) 14px", md: "minmax(0,1.3fr) minmax(0,1fr) 48px 80px 124px 14px" };

const MarketRow = ({ m, now }: { m: IRiskMarket; now: number }) => {
  const [open, setOpen] = useState(false);
  const { state, why } = marketState(m, now);
  const tag = STATE_TAG[state];
  const curator = m.curator ?? "— direct market";
  return (
    <Box borderTop="1px solid" borderColor="line">
      <Grid
        as="button"
        type="button"
        w="100%"
        textAlign="left"
        templateColumns={COLS}
        columnGap="16px"
        rowGap="6px"
        alignItems="center"
        py="12px"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        _hover={{ "& .risk-name": { color: "accent" } }}
      >
        <Box minW={0}>
          <Text className="risk-name" fontSize="sm" color={state === "excluded" ? "ink2" : "ink"} noOfLines={1} transition="color 120ms">
            {m.market}
          </Text>
          <Text fontSize="xs" color="ink3" noOfLines={1}>
            {tag ? (
              <Text as="span" fontFamily="mono" fontSize="10px" letterSpacing="0.1em" textTransform="uppercase" color={tag.color} mr="6px">
                {tag.label}
              </Text>
            ) : null}
            {PROTOCOL_NAMES[m.protocol] ?? m.protocol} · {ago(m.computedAt, now)}
          </Text>
        </Box>
        <Box display={{ base: "none", md: "block" }} minW={0}>
          <Text fontSize="sm" color={m.curator ? "ink2" : "ink3"} noOfLines={1}>
            {curator}
          </Text>
        </Box>
        <Text display={{ base: "none", md: "block" }} fontFamily="mono" fontSize="16px" color={m.gatesPassed ? "ink" : "ink3"}>
          {m.gatesPassed ? m.score : "—"}
        </Text>
        <Box display={{ base: "none", md: "block" }}>
          <GateTicks m={m} />
        </Box>
        <Box display={{ base: "none", md: "block" }}>
          <CapBar share={m.share} cap={m.maxAllocationPct} />
        </Box>
        <Text color="ink3" fontSize="12px" transform={open ? "rotate(90deg)" : undefined} transition="transform 120ms">
          ›
        </Text>
        {/* Mobile: the numbers on a second line */}
        <Flex display={{ base: "flex", md: "none" }} gridColumn="1 / -1" gap="6px 16px" wrap="wrap" fontFamily="mono" fontSize="11px" color="ink3">
          <Text>{curator}</Text>
          <Text>
            score{" "}
            <Text as="span" color="ink">
              {m.gatesPassed ? m.score : "—"}
            </Text>
          </Text>
          <Text>
            gates{" "}
            <Text as="span" color={m.gatesPassed ? "ink" : "neg"}>
              {m.gatesPassed ? `${GATES.length}/${GATES.length}` : "failed"}
            </Text>
          </Text>
          <Text>
            share{" "}
            <Text as="span" color="ink">
              {pct(m.share)}
            </Text>{" "}
            / {m.maxAllocationPct}%
          </Text>
        </Flex>
      </Grid>
      <Collapse in={open} animateOpacity>
        <Flex direction="column" gap="12px" pb="16px" maxW="640px">
          <Text fontSize="sm" color="ink2">
            {why}
          </Text>
          <Flex gap="28px" wrap="wrap">
            <Kv k="Top collateral">
              {m.topCollateral.symbol}{" "}
              <Text as="span" color="ink3">
                {pct(m.topCollateral.weight)} · {m.topCollateral.cluster}
              </Text>
            </Kv>
            <Kv k="Effective N">{m.effectiveN.toFixed(1)}</Kv>
            <Kv k="Assessed">{stamp(m.computedAt)} UTC</Kv>
          </Flex>
          {m.anomalySignals.length > 0 ? (
            <Text fontFamily="mono" fontSize="11px" color="warn">
              Signals: {m.anomalySignals.join(", ").replace(/_/g, " ")}
            </Text>
          ) : null}
        </Flex>
      </Collapse>
    </Box>
  );
};

const Markets = ({ markets, now }: { markets: IRiskMarket[]; now: number }) => {
  // Markets in use first (by share), then candidates.
  const rows = [...markets].sort((a, b) => Number(a.candidate) - Number(b.candidate) || b.share - a.share);
  return (
    <Box>
      <Grid display={{ base: "none", md: "grid" }} templateColumns={COLS} columnGap="16px" pb="8px">
        <Text textStyle="eyebrow">Market</Text>
        <Text textStyle="eyebrow">Curator</Text>
        <Text textStyle="eyebrow">Score</Text>
        <Text textStyle="eyebrow">Gates</Text>
        <Text textStyle="eyebrow">Share / cap</Text>
        <span />
      </Grid>
      {rows.map(m => (
        <MarketRow key={m.market} m={m} now={now} />
      ))}
    </Box>
  );
};

// ---- reference accordions ------------------------------------------------

const RefItem = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <AccordionItem borderTop="1px solid" borderColor="line" _last={{ borderBottom: "1px solid", borderColor: "line" }}>
    <AccordionButton px="0" py="14px" _hover={{ bg: "transparent", color: "accent" }} color="ink">
      <Text flex="1" textAlign="left" fontSize="sm">
        {title}
      </Text>
      <AccordionIcon color="ink3" />
    </AccordionButton>
    <AccordionPanel px="0" pt="0" pb="18px">
      {children}
    </AccordionPanel>
  </AccordionItem>
);

const Monitored = () => (
  <Flex direction="column" gap="14px">
    <Text fontSize="sm" color="ink3" maxW="640px">
      The analyzer checks the collateral behind every market the vault uses or considers. Its caps and exclusions are hard
      limits for the allocation optimizer. Four contours run independently:
    </Text>
    {(Object.keys(CONTOURS) as IRiskContour["id"][]).map(id => (
      <Grid key={id} templateColumns={{ base: "1fr", md: "200px minmax(0,1fr)" }} gap="4px 16px">
        <Box>
          <Text fontSize="sm" color="ink">
            {CONTOURS[id].name}
          </Text>
          <Text fontFamily="mono" fontSize="11px" color="ink3">
            every {CONTOURS[id].every}
          </Text>
        </Box>
        <Text fontSize="sm" color="ink2">
          {CONTOURS[id].body}
        </Text>
      </Grid>
    ))}
  </Flex>
);

const Gates = ({ markets }: { markets: IRiskMarket[] }) => (
  <Flex direction="column" gap="4px">
    <Text fontSize="sm" color="ink3" mb="8px" maxW="640px">
      Gates run before scoring. Failing any one sets the market&apos;s allocation to zero, whatever its score. Thresholds are
      not published.
    </Text>
    {[...GATES, NO_DATA].map(g => {
      const failing = markets.filter(m => m.gateFailures.includes(g.code));
      return (
        <Flex key={g.code} align="baseline" gap="10px" py="3px" wrap="wrap">
          <Text as="span" fontFamily="mono" fontSize="11px" w="12px" color={failing.length ? "neg" : "pos"}>
            {failing.length ? "✕" : "✓"}
          </Text>
          <Text fontSize="sm" color={failing.length ? "ink" : "ink2"}>
            {g.name}
          </Text>
          {failing.length ? (
            <Text fontFamily="mono" fontSize="11px" color="neg">
              {failing.map(m => m.market).join(", ")}
            </Text>
          ) : null}
        </Flex>
      );
    })}
  </Flex>
);

const AxisData = ({ markets }: { markets: IRiskMarket[] }) => (
  <Flex direction="column" gap="12px">
    <Text fontSize="sm" color="ink3" maxW="640px">
      The score is a weighted geometric mean of seven axes, so one weak axis pulls the whole score down. Each axis is either
      measured or filled with a conservative default; two or more defaults trigger the insufficient-data gate.
    </Text>
    <Box overflowX="auto">
      <Grid templateColumns={`minmax(180px,1fr) repeat(${AXES.length}, 52px)`} minW="560px" fontSize="12px">
        <Text textStyle="eyebrow" pb="8px">
          Market
        </Text>
        {AXES.map(a => (
          <Text key={a.key} textStyle="eyebrow" pb="8px" textAlign="center" title={a.name}>
            {a.short}
          </Text>
        ))}
        {markets.map(m => [
          <Text key={`${m.market}-n`} py="7px" borderTop="1px solid" borderColor="line" color="ink2" noOfLines={1}>
            {m.market}
          </Text>,
          ...AXES.map(a => {
            const p = m.provenance[a.key];
            return (
              <Flex
                key={`${m.market}-${a.key}`}
                py="7px"
                borderTop="1px solid"
                borderColor="line"
                justify="center"
                align="center"
                title={`${a.name}: ${p === "measured" ? "measured" : p === "default" ? "default value" : "not applicable"}`}
              >
                {p === "measured" ? (
                  <Box w="7px" h="7px" bg="pos" />
                ) : p === "default" ? (
                  <Box w="7px" h="7px" border="1px solid" borderColor="warn" />
                ) : (
                  <Text color="ink3">–</Text>
                )}
              </Flex>
            );
          })
        ])}
      </Grid>
    </Box>
    <Flex gap="18px" fontFamily="mono" fontSize="11px" color="ink3" wrap="wrap">
      <Flex align="center" gap="6px">
        <Box w="7px" h="7px" bg="pos" /> measured
      </Flex>
      <Flex align="center" gap="6px">
        <Box w="7px" h="7px" border="1px solid" borderColor="warn" /> default
      </Flex>
      <Text>– not applicable</Text>
    </Flex>
  </Flex>
);

// ---------------------------------------------------------------------------

export const RiskMonitor = observer(({ pool }: { pool: IPoolData }) => {
  const { activeChain } = useStore("poolsStore");
  const [data, setData] = useState<IRiskMonitor | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [now, setNow] = useState(() => Date.now());

  // Poll like a live feed: a snapshot loaded once would age past its TTL and read as stale.
  useEffect(() => {
    let cancelled = false;
    setData(null);
    setState("loading");
    const load = () =>
      getRiskMonitor(pool.token, activeChain as never)
        .then(res => {
          if (cancelled) return;
          setData(res);
          setNow(Date.now());
          setState("ready");
        })
        .catch(() => !cancelled && setState(s => (s === "ready" ? s : "unavailable")));
    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
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
          <Text fontFamily="mono" fontSize="11px" color="ink3">
            Last assessment {ago(data.computedAt, now)}
          </Text>
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
            <Skeleton h="220px" />
            <Skeleton h="180px" />
          </Flex>
        ) : (
          <>
            <Grid templateColumns={{ base: "1fr", xl: "minmax(0,1fr) 240px" }} gap="12px" alignItems="start">
              <DecisionLog items={data.conclusions} />
              <ContourStatus contours={data.contours} />
            </Grid>

            <Box mt="28px">
              <Markets markets={data.markets} now={now} />
            </Box>

            <Accordion allowMultiple mt="28px">
              <RefItem title="What is monitored">
                <Monitored />
              </RefItem>
              <RefItem title="Hard gates">
                <Gates markets={data.markets} />
              </RefItem>
              <RefItem title="Data per axis">
                <AxisData markets={data.markets} />
              </RefItem>
            </Accordion>

            <Flex mt="16px" align="center" gap="8px" wrap="wrap">
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
