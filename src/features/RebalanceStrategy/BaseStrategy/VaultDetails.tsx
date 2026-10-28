"use client";
import { Box, Flex, Grid, Link, Text, useClipboard } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import { IPoolData } from "@/api/pools/types";
import { Tooltip } from "@/components/tooltip";
import { DEMO_MODE } from "@/demo/config";
import { useStore } from "@/hooks/useStoreContext";
import { formatNumber } from "@/utils/formatNumber";

/**
 * Pool page: what a depositor gets after fees, how quickly money comes back, and the
 * vault's fixed parameters. Benchmarks: Ember (yield composition, vault details) and
 * Gauntlet (settlement notes next to the numbers).
 */

const EXPLORERS: Record<string, string> = {
  Ethereum: "https://etherscan.io",
  Arbitrum: "https://arbiscan.io",
  Base: "https://basescan.org",
  BSC: "https://bscscan.com"
};

const pct = (v: number, digits = 2) => `${v.toFixed(digits)}%`;
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const ESTIMATE_AMOUNTS = [1_000, 10_000, 100_000];
const whole = (v: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);
const compact = (v: number) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(v);

const Card = ({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) => (
  <Flex direction="column" minW={0} bg="bg2" border="1px solid" borderColor="line" borderRadius="10px" p={{ base: "16px", md: "24px" }}>
    <Flex justify="space-between" align="baseline" gap="12px" mb="12px">
      <Text textStyle="eyebrow">{title}</Text>
      {right}
    </Flex>
    {children}
  </Flex>
);

const Line = ({ label, value, hint, strong, tone }: { label: string; value: React.ReactNode; hint?: string; strong?: boolean; tone?: string }) => (
  <Flex justify="space-between" align="baseline" gap="12px" py="9px" borderTop="1px solid" borderColor="line">
    {hint ? (
      <Tooltip label={hint}>
        <Text fontSize="sm" color={strong ? "ink" : "ink2"} cursor="help" borderBottom="1px dashed" borderColor="lineStrong">
          {label}
        </Text>
      </Tooltip>
    ) : (
      <Text fontSize="sm" color={strong ? "ink" : "ink2"}>
        {label}
      </Text>
    )}
    <Text
      fontFamily="mono"
      fontSize={strong ? "md" : "sm"}
      color={tone ?? "ink"}
      textAlign="right"
      sx={{ fontVariantNumeric: "tabular-nums" }}
    >
      {value}
    </Text>
  </Flex>
);

const Address = ({ address, explorer }: { address: string; explorer: string }) => {
  const { hasCopied, onCopy } = useClipboard(address);
  return (
    <Flex as="span" display="inline-flex" align="center" gap="8px">
      {short(address)}
      <Box as="button" type="button" onClick={onCopy} aria-label="Copy address" color="ink3" _hover={{ color: "accent" }}>
        {hasCopied ? "✓" : "⧉"}
      </Box>
      {DEMO_MODE ? null : (
        <Link href={`${explorer}/address/${address}`} isExternal aria-label="Open in explorer" color="ink3" _hover={{ color: "accent" }}>
          ↗
        </Link>
      )}
    </Flex>
  );
};

export const VaultDetails = observer(({ pool }: { pool: IPoolData }) => {
  const { activeChain } = useStore("poolsStore");
  const [amount, setAmount] = useState(ESTIMATE_AMOUNTS[1]!);
  const t = pool.terms;
  if (!t) return null;

  const net = pool.avgApr ?? 0;
  const gross = net / (1 - t.performanceFee - t.managementFee || 1);
  const fee = gross - net;
  const idleShare = pool.allocations?.find(a => a.protocol === "idle")?.share ?? 0;
  const idleUsd = pool.funds * idleShare;
  const explorer = EXPLORERS[activeChain] ?? EXPLORERS.Ethereum!;
  const yearly = (amount * net) / 100;

  return (
    <Flex direction="column" w="100%">
      <Text textStyle="h2" mt="48px" mb="12px">
        Yield and withdrawals
      </Text>
      <Grid templateColumns={{ base: "1fr", xl: "minmax(0,1fr) minmax(0,1fr)" }} gap="16px">
        <Card title="Yield composition · 30D">
          <Line label="Lending yield" value={pct(gross)} hint="Interest earned across the vault's markets before fees, 30-day average." />
          <Line label="Rewards" value={pct(0)} hint="Incentive tokens. This vault does not count rewards in its APY." />
          <Line label={`Performance fee (${pct(t.performanceFee * 100, 0)})`} value={`−${pct(fee)}`} tone="ink2" hint="Taken from yield only, never from principal." />
          {t.managementFee > 0 ? <Line label="Management fee" value={`−${pct(t.managementFee * 100)}`} tone="ink2" /> : null}
          <Line label="Net APY to you" value={pct(net)} strong tone="pos" />
          <Flex mt="16px" direction="column" gap="10px">
            <Flex justify="space-between" align="center" gap="12px" wrap="wrap">
              <Text fontSize="sm" color="ink2">
                Estimate on
              </Text>
              <Flex gap="6px">
                {ESTIMATE_AMOUNTS.map(a => (
                  <Box
                    key={a}
                    as="button"
                    type="button"
                    onClick={() => setAmount(a)}
                    aria-pressed={a === amount}
                    px="10px"
                    py="4px"
                    fontFamily="mono"
                    fontSize="xs"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor={a === amount ? "accent" : "line"}
                    color={a === amount ? "accent" : "ink2"}
                    _hover={{ color: "ink" }}
                  >
                    {compact(a)} {pool.token}
                  </Box>
                ))}
              </Flex>
            </Flex>
            <Text fontFamily="mono" fontSize="sm" color="ink">
              ≈ {whole(yearly)} {pool.token} a year · {whole(yearly / 12)} a month
            </Text>
            <Text fontSize="xs" color="ink3">
              At the current 30-day net APY. Rates are variable; this is not a promise of future returns.
            </Text>
          </Flex>
        </Card>

        <Card title="Withdrawals">
          <Line
            label="Available instantly"
            value={`$${formatNumber(idleUsd)} · ${pct(idleShare * 100, 0)}`}
            hint="The idle buffer held in the vault contract. Withdrawals up to this amount settle in one transaction."
          />
          <Line
            label="Above the buffer"
            value="Pulled from markets"
            hint="The vault withdraws from its markets on request, limited by their available liquidity at that moment."
          />
          <Line
            label="Worst-case exit"
            value={`up to ${t.withdrawSlaHours} h`}
            hint="Exit-time limit every market must meet under stress to be eligible. Markets that cannot are capped or excluded by risk monitoring."
          />
          <Line label="Lock-up" value="None" />
          <Line label="Withdrawal fee" value="None" />
          <Text mt="16px" fontSize="xs" color="ink3">
            Deposits and withdrawals can be paused separately by the Watchdog role in an emergency; see Governance below.
          </Text>
        </Card>
      </Grid>

      <Text textStyle="h2" mt="48px" mb="12px">
        Vault details
      </Text>
      <Box bg="bg2" border="1px solid" borderColor="line" borderRadius="10px" p={{ base: "16px", md: "24px" }}>
        <Grid templateColumns={{ base: "1fr", md: "minmax(0,1fr) minmax(0,1fr)" }} columnGap="40px">
          <Box>
            <Line label="Vault contract" value={<Address address={pool.rebalancerAddress} explorer={explorer} />} />
            <Line label="Share token" value={t.shareToken} hint="ERC-4626 share. Its price in the deposit asset grows as yield accrues." />
            <Line label="Deposit asset" value={pool.token} />
            <Line label="Network" value={activeChain} />
            <Line label="Launched" value={t.launchedAt} />
            <Line label="Strategy" value="Automated lending allocation" />
            <Line label="Yield type" value="Share price growth" />
          </Box>
          <Box>
            <Line label="Performance fee" value={`${pct(t.performanceFee * 100, 0)} of yield`} hint="Capped at 20% in the contract." />
            <Line label="Management fee" value={pct(t.managementFee * 100, 0)} hint="Capped at 5% in the contract." />
            <Line label="Minimum deposit" value={`${t.minDeposit} ${pool.token}`} />
            <Line label="Maximum vault size" value={t.capUsd ? `$${formatNumber(t.capUsd)}` : "No cap"} />
            <Line label="Rewards" value="None" />
            <Line label="Price updates" value="Every block" />
            <Line
              label="Audits"
              value={
                t.audits.length
                  ? t.audits.map((a, i) => (
                      <Link key={a.firm} href={a.url} isExternal color="accent" ml={i ? "8px" : 0}>
                        {a.firm} ↗
                      </Link>
                    ))
                  : "Reports pending"
              }
            />
          </Box>
        </Grid>
      </Box>
    </Flex>
  );
});
