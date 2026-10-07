"use client";
import { Box, Flex, Grid, Link, Skeleton, Text, Tooltip, useClipboard } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import { getVaultGovernance } from "@/api/pools/queries";
import { IPoolData, IRoleHolder, IVaultGovernance, VaultRole } from "@/api/pools/types";
import { StatusPill } from "@/components/status-pill";
import { DEMO_MODE } from "@/demo/config";
import { useStore } from "@/hooks/useStoreContext";

/**
 * Pool page: who controls the vault and which changes wait behind the timelock.
 * Permissions and limits follow the deployed Rebalancer (RoleManager roles + Timelock).
 */

const ROLES: Record<VaultRole, { name: string; can: string }> = {
  admin: {
    name: "Admin",
    can: "Grants and revokes roles. Removes a market only when it holds no vault funds. Sets the entry market. No delay."
  },
  executor: {
    name: "Executor",
    can: "Runs rebalances: moves funds only between markets already on the vault's list."
  },
  curator: {
    name: "Curator",
    can: "Sets the management fee (max 5%) and performance fee (max 20%), the minimum deposit and the maximum vault size. No delay."
  },
  watchdog: {
    name: "Watchdog",
    can: "Pauses deposits or withdrawals, separately. Runs emergency withdraw with a single key: funds move from chosen markets into the vault contract itself."
  },
  recovery: {
    name: "Recovery",
    can: "Resumes deposits or withdrawals and re-allocates idle funds to listed markets after an emergency withdraw."
  },
  treasury: {
    name: "Treasury",
    can: "Receives fees as newly minted vault shares. Holds no permissions."
  }
};

const DELAYED = [
  { name: "Add a market", body: "Put a new lending market on the vault's list" },
  { name: "Force-remove a market", body: "Remove a market that still holds vault funds" },
  { name: "Change treasury or timelock", body: "Point fees or the timelock to a new address" }
];

const INSTANT = [
  { name: "Pause deposits or withdrawals", role: "Watchdog", body: "Only Recovery can resume" },
  { name: "Emergency withdraw", role: "Watchdog", body: "Single key; funds return to the vault only" },
  { name: "Fees, minimum deposit, maximum vault size", role: "Curator", body: "Fees capped at 5% / 20% in code" },
  { name: "Remove an empty market, entry market", role: "Admin", body: "Only markets holding no vault funds" }
];

const EXPLORERS: Record<string, string> = {
  Ethereum: "https://etherscan.io",
  Arbitrum: "https://arbiscan.io",
  Base: "https://basescan.org",
  BSC: "https://bscscan.com"
};

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const duration = (s: number) => {
  if (s % 86_400 === 0) return `${s / 86_400} ${s === 86_400 ? "day" : "days"}`;
  if (s % 3_600 === 0) return `${s / 3_600} h`;
  return `${Math.round(s / 60)} min`;
};

const until = (iso: string, now: number) => {
  const ms = Date.parse(iso) - now;
  if (ms <= 0) return "executable now";
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  return `executable in ${d ? `${d} d ` : ""}${h % 24} h`;
};

// ---------------------------------------------------------------------------

const Info = ({ label }: { label: string }) => (
  <Tooltip label={label} hasArrow placement="top" maxW="300px" bg="bg3" color="ink" fontSize="xs" p="10px" borderRadius="2px">
    <Box
      as="span"
      tabIndex={0}
      aria-label={label}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w="14px"
      h="14px"
      borderRadius="50%"
      border="1px solid"
      borderColor="ink3"
      color="ink3"
      fontSize="9px"
      fontFamily="mono"
      cursor="help"
      flexShrink={0}
      _hover={{ color: "ink", borderColor: "ink" }}
    >
      i
    </Box>
  </Tooltip>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <Flex justify="space-between" align="center" gap="12px" py="10px" borderTop="1px solid" borderColor="line" minH="44px">
    {children}
  </Flex>
);

const IconBtn = ({ label, onClick, href, children }: { label: string; onClick?: () => void; href?: string; children: React.ReactNode }) => (
  <Box
    as={href ? Link : "button"}
    {...(href ? { href, isExternal: true } : { type: "button", onClick })}
    aria-label={label}
    title={label}
    display="inline-flex"
    alignItems="center"
    justifyContent="center"
    w="22px"
    h="22px"
    color="ink3"
    fontFamily="mono"
    fontSize="12px"
    _hover={{ color: "accent", textDecoration: "none" }}
  >
    {children}
  </Box>
);

const Holder = ({ h, explorer }: { h: IRoleHolder; explorer: string }) => {
  const { hasCopied, onCopy } = useClipboard(h.address);
  return (
    <Flex align="center" gap="8px" minW={0}>
      <Text
        as="span"
        fontFamily="mono"
        fontSize="10px"
        letterSpacing="0.1em"
        textTransform="uppercase"
        color={h.kind === "safe" ? "accent" : "ink3"}
        border="1px solid"
        borderColor={h.kind === "safe" ? "accentAlpha.60" : "lineStrong"}
        px="5px"
        py="2px"
        whiteSpace="nowrap"
      >
        {h.kind === "safe" ? `Safe ${h.threshold ?? ""}`.trim() : h.kind === "contract" ? "Contract" : "EOA"}
      </Text>
      <Text fontFamily="mono" fontSize="12px" color="ink2" whiteSpace="nowrap">
        {short(h.address)}
      </Text>
      <IconBtn label={hasCopied ? "Copied" : "Copy address"} onClick={onCopy}>
        {hasCopied ? "✓" : "⧉"}
      </IconBtn>
      {DEMO_MODE ? null : (
        <IconBtn label="Open in explorer" href={`${explorer}/address/${h.address}`}>
          ↗
        </IconBtn>
      )}
    </Flex>
  );
};

const Col = ({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) => (
  <Flex direction="column" minW={0}>
    <Flex justify="space-between" align="baseline" gap="12px" mb="8px">
      <Text textStyle="eyebrow">{title}</Text>
      {right}
    </Flex>
    {children}
  </Flex>
);

// ---------------------------------------------------------------------------

export const Governance = observer(({ pool }: { pool: IPoolData }) => {
  const { activeChain } = useStore("poolsStore");
  const [data, setData] = useState<IVaultGovernance | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setState("loading");
    getVaultGovernance(pool.token, activeChain as never)
      .then(res => {
        if (cancelled) return;
        setData(res);
        setNow(Date.now());
        setState("ready");
      })
      .catch(() => !cancelled && setState("unavailable"));
    return () => {
      cancelled = true;
    };
  }, [pool.token, activeChain]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const explorer = EXPLORERS[activeChain] ?? EXPLORERS.Ethereum!;

  return (
    <Flex direction="column" w="100%">
      <Text textStyle="h2" mt="48px" mb="12px">
        Governance
      </Text>
      <Box bg="bg2" borderWidth="1px" borderStyle="solid" borderColor="line" borderRadius="2px" p={{ base: "16px", md: "24px" }}>
        {state === "unavailable" ? (
          <Flex minH="120px" align="center" justify="center">
            <Text fontSize="sm" color="ink3">
              Governance details are not available for this vault yet.
            </Text>
          </Flex>
        ) : !data ? (
          <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap="32px">
            <Skeleton h="200px" />
            <Skeleton h="200px" />
          </Grid>
        ) : (
          <>
            <Grid templateColumns={{ base: "1fr", xl: "minmax(0,1fr) minmax(0,1fr)" }} gap={{ base: "28px", xl: "40px" }}>
              <Col title="Roles">
                {data.roles.map(h => (
                  <Row key={h.role}>
                    <Flex align="center" gap="8px" minW={0}>
                      <Text fontSize="sm" color="ink" whiteSpace="nowrap">
                        {ROLES[h.role].name}
                      </Text>
                      <Info label={ROLES[h.role].can} />
                    </Flex>
                    <Holder h={h} explorer={explorer} />
                  </Row>
                ))}
                <Row>
                  <Flex align="center" gap="8px">
                    <Text fontSize="sm" color="ink">
                      Timelock
                    </Text>
                    <Info label="Contract that holds changes to the market list and to itself until the delay has passed." />
                  </Flex>
                  <Holder h={{ role: "admin", address: data.timelock.address, kind: "contract" }} explorer={explorer} />
                </Row>
              </Col>

              <Col
                title="Timelock"
                right={
                  <Text fontFamily="mono" fontSize="11px" color="ink3">
                    delay{" "}
                    <Text as="span" color="ink">
                      {duration(data.timelock.delaySeconds)}
                    </Text>
                  </Text>
                }
              >
                {data.queued.length ? (
                  data.queued.map(q => (
                    <Flex
                      key={q.action}
                      justify="space-between"
                      align="center"
                      gap="12px"
                      px="10px"
                      py="8px"
                      mb="6px"
                      bg="accentTint"
                      border="1px solid"
                      borderColor="accentAlpha.60"
                      wrap="wrap"
                    >
                      <Text fontSize="sm" color="ink">
                        <Text as="span" fontFamily="mono" fontSize="10px" letterSpacing="0.12em" color="accent" mr="8px">
                          QUEUED
                        </Text>
                        {q.action}
                      </Text>
                      <Text fontFamily="mono" fontSize="11px" color="ink2" whiteSpace="nowrap">
                        {until(q.eta, now)}
                      </Text>
                    </Flex>
                  ))
                ) : (
                  <Text fontFamily="mono" fontSize="11px" color="ink3" mb="6px">
                    No queued changes
                  </Text>
                )}
                {DELAYED.map(d => (
                  <Row key={d.name}>
                    <Box minW={0}>
                      <Text fontSize="sm" color="ink">
                        {d.name}
                      </Text>
                      <Text fontSize="xs" color="ink3">
                        {d.body}
                      </Text>
                    </Box>
                    <Text fontFamily="mono" fontSize="12px" color="ink" whiteSpace="nowrap">
                      {duration(data.timelock.delaySeconds)}
                    </Text>
                  </Row>
                ))}
                {INSTANT.map(d => (
                  <Row key={d.name}>
                    <Box minW={0}>
                      <Text fontSize="sm" color="ink">
                        {d.name}
                      </Text>
                      <Text fontSize="xs" color="ink3">
                        {d.role} · {d.body}
                      </Text>
                    </Box>
                    <Text fontFamily="mono" fontSize="12px" color="warn" whiteSpace="nowrap">
                      no delay
                    </Text>
                  </Row>
                ))}
              </Col>
            </Grid>

            <Flex mt="16px" pt="12px" borderTop="1px solid" borderColor="line" align="center" gap="8px" wrap="wrap">
              <Text fontFamily="mono" fontSize="11px" color="ink3">
                Timelock delay is set per vault, minimum 30 minutes. Emergency withdraw and pauses take effect immediately.
              </Text>
              {DEMO_MODE ? <StatusPill kind="DEMO DATA" /> : null}
            </Flex>
          </>
        )}
      </Box>
    </Flex>
  );
});
