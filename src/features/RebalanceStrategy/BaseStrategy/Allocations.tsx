"use client";
import { Box, Flex, Grid, IconButton, Link, Skeleton, Text } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";

import { getRebalances } from "@/api/pools/queries";
import { IPoolAllocation, IPoolData, IRebalancePage, RebalanceReason } from "@/api/pools/types";
import { StatusPill } from "@/components/status-pill";
import { DEMO_MODE } from "@/demo/config";
import { useStore } from "@/hooks/useStoreContext";
import { tokens } from "@/themes/styles/colors";
import { formatNumber } from "@/utils/formatNumber";

type Tab = "destinations" | "protocols" | "rebalances";

const TABS: { id: Tab; label: string }[] = [
  { id: "destinations", label: "Destinations" },
  { id: "protocols", label: "Protocols" },
  { id: "rebalances", label: "Rebalances" }
];

// Same order as the allocation bar on vault cards, so colours match across pages.
const TONES = [tokens.accent, tokens.ink2, tokens.ink3, tokens.lineStrong, tokens.muted];

const PROTOCOL_NAMES: Record<string, string> = {
  aave: "Aave v3",
  morpho: "Morpho",
  euler: "Euler",
  compound: "Compound v3",
  fluid: "Fluid",
  idle: "Vault (idle)"
};
const protocolName = (p: string) => PROTOCOL_NAMES[p] ?? p;

const EXPLORERS: Record<string, string> = {
  Ethereum: "https://etherscan.io",
  Arbitrum: "https://arbiscan.io",
  Base: "https://basescan.org",
  BSC: "https://bscscan.com"
};

const REASON_LABEL: Record<RebalanceReason, string> = {
  rate: "Rate",
  new_liquidity: "New liquidity",
  utilization: "Utilization",
  risk_gate: "Risk gate",
  manual: "Manual"
};

const pct = (share: number) => `${(share * 100).toFixed(1).replace(/\.0$/, "")}%`;
const formatUtc = (iso: string) => `${new Date(iso).toISOString().slice(0, 16).replace("T", " ")} UTC`;

// ---------------------------------------------------------------------------

const Segmented = ({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) => (
  <Flex
    role="tablist"
    aria-label="Allocation view"
    borderWidth="1px"
    borderStyle="solid"
    borderColor="lineStrong"
    borderRadius="2px"
    bg="bg"
    p="2px"
    gap="2px"
  >
    {TABS.map(t => (
      <Box
        as="button"
        key={t.id}
        role="tab"
        aria-selected={value === t.id}
        onClick={() => onChange(t.id)}
        px="12px"
        py="4px"
        borderRadius="2px"
        fontSize="sm"
        color={value === t.id ? "ink" : "ink3"}
        bg={value === t.id ? "lineStrong" : "transparent"}
        _hover={{ color: "ink" }}
        transition="color 120ms, background-color 120ms"
      >
        {t.label}
      </Box>
    ))}
  </Flex>
);

interface Row {
  key: string;
  label: string;
  sub?: string;
  share: number;
  color: string;
}

const Breakdown = ({
  rows,
  columnLabel,
  funds,
  tokenSymbol,
  tokenPrice
}: {
  rows: Row[];
  columnLabel: string;
  funds: number;
  tokenSymbol: string;
  tokenPrice: number;
}) => {
  const [active, setActive] = useState<number | null>(null);
  const focus = rows[active ?? 0];

  return (
    <Flex gap="28px" wrap="wrap" align="center">
      {/* Donut */}
      <Box position="relative" w="168px" h="168px" flexShrink={0} mx={{ base: "auto", md: 0 }}>
        <PieChart width={168} height={168}>
          <Pie
            data={rows}
            dataKey="share"
            nameKey="label"
            innerRadius={66}
            outerRadius={80}
            paddingAngle={rows.length > 1 ? 1.5 : 0}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
            onMouseEnter={(_, i) => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            {rows.map((r, i) => (
              <Cell key={r.key} fill={r.color} opacity={active === null || active === i ? 1 : 0.3} />
            ))}
          </Pie>
        </PieChart>
        {focus ? (
          <Flex
            position="absolute"
            inset="0"
            direction="column"
            align="center"
            justify="center"
            textAlign="center"
            px="28px"
            pointerEvents="none"
          >
            <Text fontFamily="mono" fontSize="24px" lineHeight="1.1" color="ink">
              {pct(focus.share)}
            </Text>
            <Text fontSize="11px" color="ink3" mt="4px" noOfLines={2}>
              {focus.label}
            </Text>
          </Flex>
        ) : null}
      </Box>

      {/* Table */}
      <Box flex="1" minW="260px">
        <Grid templateColumns="minmax(0, 1fr) auto 56px" columnGap="16px" alignItems="center">
          <Text textStyle="eyebrow" pb="10px">
            {columnLabel}
          </Text>
          <Text textStyle="eyebrow" pb="10px" textAlign="right">
            Allocation
          </Text>
          <Text textStyle="eyebrow" pb="10px" textAlign="right">
            Share
          </Text>
          {rows.map((r, i) => {
            const amount = r.share * funds;
            const hover = {
              onMouseEnter: () => setActive(i),
              onMouseLeave: () => setActive(null),
              opacity: active === null || active === i ? 1 : 0.55,
              transition: "opacity 120ms"
            };
            return [
              <Flex key={`${r.key}-l`} align="center" gap="10px" py="10px" borderTop="1px solid" borderColor="line" minW={0} {...hover}>
                <Box w="8px" h="8px" bg={r.color} flexShrink={0} />
                <Box minW={0}>
                  <Text fontSize="sm" color="ink" noOfLines={1}>
                    {r.label}
                  </Text>
                  {r.sub ? (
                    <Text fontSize="xs" color="ink3" noOfLines={1}>
                      {r.sub}
                    </Text>
                  ) : null}
                </Box>
              </Flex>,
              <Box key={`${r.key}-a`} py="10px" borderTop="1px solid" borderColor="line" textAlign="right" {...hover}>
                <Text fontFamily="mono" fontSize="sm" color="ink">
                  {formatNumber(amount)} {tokenSymbol}
                </Text>
                <Text fontFamily="mono" fontSize="xs" color="ink3">
                  ${formatNumber(amount * tokenPrice)}
                </Text>
              </Box>,
              <Text
                key={`${r.key}-p`}
                py="10px"
                borderTop="1px solid"
                borderColor="line"
                textAlign="right"
                fontFamily="mono"
                fontSize="sm"
                color="ink"
                alignSelf="stretch"
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                {...hover}
              >
                {pct(r.share)}
              </Text>
            ];
          })}
        </Grid>
      </Box>
    </Flex>
  );
};

// ---------------------------------------------------------------------------

const PAGE_SIZE = 5;

const RebalanceLog = ({ pool, chainName }: { pool: IPoolData; chainName: string }) => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<IRebalancePage | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    getRebalances(pool.token, chainName as never, page, PAGE_SIZE)
      .then(res => {
        if (cancelled) return;
        setData(res);
        setState("ready");
      })
      .catch(() => !cancelled && setState("unavailable"));
    return () => {
      cancelled = true;
    };
  }, [pool.token, chainName, page]);

  if (state === "unavailable") {
    return <EmptyState text="Rebalance history is not available for this vault yet." />;
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const explorer = EXPLORERS[chainName] ?? EXPLORERS.Ethereum;

  return (
    <Flex direction="column">
      {state === "loading" && !data
        ? Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} h="64px" mb="8px" />)
        : data?.items.map(e => (
            <Box key={e.id} py="14px" borderBottom="1px solid" borderColor="line" opacity={state === "loading" ? 0.5 : 1}>
              <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap={{ base: "4px", md: "12px" }} mb="8px">
                <Flex align="center" gap="8px">
                  <Text fontFamily="mono" fontSize="11px" letterSpacing="0.14em" color="ink2" whiteSpace="nowrap">
                    REBALANCE #{e.id}
                  </Text>
                  {e.txHash && !DEMO_MODE ? (
                    <Link
                      href={`${explorer}/tx/${e.txHash}`}
                      isExternal
                      aria-label={`Transaction for rebalance ${e.id}`}
                      color="accent"
                      fontFamily="mono"
                      fontSize="12px"
                    >
                      ↗
                    </Link>
                  ) : null}
                  <Text
                    as="span"
                    fontFamily="mono"
                    fontSize="10px"
                    letterSpacing="0.12em"
                    textTransform="uppercase"
                    color={e.reason === "risk_gate" ? "neg" : "ink3"}
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor={e.reason === "risk_gate" ? "negAlpha.60" : "lineStrong"}
                    px="5px"
                    py="1px"
                    borderRadius="1px"
                    whiteSpace="nowrap"
                  >
                    {REASON_LABEL[e.reason] ?? e.reason}
                  </Text>
                </Flex>
                <Text fontFamily="mono" fontSize="11px" color="ink3" whiteSpace="nowrap">
                  {formatUtc(e.ts)}
                </Text>
              </Flex>
              {/* md+: from ─ amount ─→ to on one line; mobile: stacked */}
              <Grid
                templateColumns={{ base: "1fr", md: "minmax(0,1fr) auto minmax(0,1fr)" }}
                columnGap="12px"
                rowGap="4px"
                alignItems="center"
              >
                <Text fontSize="sm" color="ink" noOfLines={1}>
                  <Text as="span" display={{ base: "inline", md: "none" }} color="ink3" fontSize="xs" mr="6px">
                    From
                  </Text>
                  {e.from}
                </Text>
                <Flex align="center" gap="8px" color="ink3" order={{ base: 3, md: 0 }}>
                  <Box display={{ base: "none", md: "block" }} w="24px" borderTop="1px dashed" borderColor="lineStrong" />
                  <Text fontFamily="mono" fontSize="sm" color="ink" whiteSpace="nowrap">
                    {formatNumber(e.amount)} {pool.token}
                  </Text>
                  <Box display={{ base: "none", md: "block" }} w="24px" borderTop="1px dashed" borderColor="lineStrong" />
                  <Text display={{ base: "none", md: "block" }} fontFamily="mono" fontSize="xs">
                    →
                  </Text>
                </Flex>
                <Text fontSize="sm" color="ink" noOfLines={1} textAlign={{ base: "left", md: "right" }}>
                  <Text as="span" display={{ base: "inline", md: "none" }} color="ink3" fontSize="xs" mr="6px">
                    To
                  </Text>
                  {e.to}
                </Text>
              </Grid>
            </Box>
          ))}

      {data && data.total === 0 ? <EmptyState text="No rebalances yet." /> : null}

      {data && data.total > 0 ? (
        <Flex justify="space-between" align="center" pt="16px">
          <Text fontFamily="mono" fontSize="11px" color="ink3">
            {data.total} rebalances
          </Text>
          <Flex align="center" gap="4px">
            <IconButton
              aria-label="Previous page"
              size="sm"
              variant="secondaryOutline"
              icon={<Text as="span">‹</Text>}
              isDisabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            />
            <Text fontFamily="mono" fontSize="12px" color="ink2" px="10px">
              {page} / {pages}
            </Text>
            <IconButton
              aria-label="Next page"
              size="sm"
              variant="secondaryOutline"
              icon={<Text as="span">›</Text>}
              isDisabled={page >= pages}
              onClick={() => setPage(p => p + 1)}
            />
          </Flex>
        </Flex>
      ) : null}
    </Flex>
  );
};

const EmptyState = ({ text }: { text: string }) => (
  <Flex minH="160px" align="center" justify="center">
    <Text fontSize="sm" color="ink3">
      {text}
    </Text>
  </Flex>
);

// ---------------------------------------------------------------------------

const toRows = (allocations: IPoolAllocation[]): Row[] =>
  [...allocations]
    .sort((a, b) => b.share - a.share)
    .map((a, i) => ({
      key: a.destination,
      label: a.destination,
      sub: protocolName(a.protocol),
      share: a.share,
      color: TONES[i % TONES.length]!
    }));

const toProtocolRows = (allocations: IPoolAllocation[]): Row[] => {
  const byProtocol = new Map<string, { share: number; count: number }>();
  for (const a of allocations) {
    const cur = byProtocol.get(a.protocol) ?? { share: 0, count: 0 };
    byProtocol.set(a.protocol, { share: cur.share + a.share, count: cur.count + 1 });
  }
  return Array.from(byProtocol.entries())
    .sort((a, b) => b[1].share - a[1].share)
    .map(([protocol, v], i) => ({
      key: protocol,
      label: protocolName(protocol),
      sub: `${v.count} ${v.count === 1 ? "market" : "markets"}`,
      share: v.share,
      color: TONES[i % TONES.length]!
    }));
};

/** Pool page: where the vault's liquidity sits now, by market and by protocol, and how it moved. */
export const Allocations = observer(({ pool }: { pool: IPoolData }) => {
  const [tab, setTab] = useState<Tab>("destinations");
  const { activeChain } = useStore("poolsStore");
  const allocations = pool.allocations ?? [];
  const destinationRows = useMemo(() => toRows(allocations), [allocations]);
  const protocolRows = useMemo(() => toProtocolRows(allocations), [allocations]);

  return (
    <Flex direction="column" w="100%">
      <Flex mt="48px" mb="12px" justify="space-between" align="center" gap="12px" wrap="wrap">
        <Text textStyle="h2">Allocations</Text>
        <Segmented value={tab} onChange={setTab} />
      </Flex>
      <Box
        bg="bg2"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="line"
        borderRadius="2px"
        p={{ base: "16px", md: "24px" }}
        role="tabpanel"
      >
        {tab === "rebalances" ? (
          <RebalanceLog pool={pool} chainName={activeChain} />
        ) : allocations.length === 0 ? (
          <EmptyState text="Allocation breakdown is not available for this vault yet." />
        ) : (
          <Breakdown
            rows={tab === "destinations" ? destinationRows : protocolRows}
            columnLabel={tab === "destinations" ? "Destination" : "Protocol"}
            funds={pool.funds}
            tokenSymbol={pool.token}
            tokenPrice={pool.tokenPriceInUsd || 1}
          />
        )}
        {tab !== "rebalances" && allocations.length > 0 ? (
          <Flex mt="16px" pt="12px" borderTop="1px solid" borderColor="line" align="center" gap="8px" wrap="wrap">
            <Text fontFamily="mono" fontSize="11px" color="ink3">
              {pool.asOf ? `As of ${formatUtc(pool.asOf)} · ` : ""}Allocation is not fixed and changes with every rebalance.
            </Text>
            {DEMO_MODE ? <StatusPill kind="DEMO DATA" /> : null}
          </Flex>
        ) : null}
      </Box>
    </Flex>
  );
});
