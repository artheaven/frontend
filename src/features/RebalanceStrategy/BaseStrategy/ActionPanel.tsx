"use client";
import { Box, Button, Collapse, Flex, Input, Text } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";

import { IPoolData } from "@/api/pools/types";
import { TokenIcon } from "@/components/token-icon";
import { Tooltip } from "@/components/tooltip";
import { DEMO_MODE } from "@/demo/config";
import { demoLedger } from "@/demo/ledger";
import { ConnectWallet } from "@/features/ConnectWallet";
import ApproveBtn from "@/features/modals/deposit-or-withdraw-modal/components/ApproveBtn";
import { useBalanceOfAsset } from "@/hooks/useBalanceOfAsset";
import { useDeposit } from "@/hooks/useDeposit";
import { useWithdraw } from "@/hooks/useWithdraw";

type Mode = "deposit" | "withdraw";

const PERFORMANCE_FEE = 0.15;
const MIN_DEPOSIT = 1;
const NETWORK_FEE_ETH = 0.000005; // same estimate the deposit modal used
export const ACTION_AMOUNT_INPUT_ID = "action-panel-amount";

const fmt = (v: number, max = 2) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: max }).format(v);
const floor2 = (v: number) => Math.floor(v * 100) / 100;

const Row = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <Flex justify="space-between" align="center" gap="12px">
    {hint ? (
      <Tooltip label={hint}>
        <Text fontSize="sm" color="ink3" cursor="help" borderBottom="1px dashed" borderColor="lineStrong">
          {label}
        </Text>
      </Tooltip>
    ) : (
      <Text fontSize="sm" color="ink3">
        {label}
      </Text>
    )}
    <Text fontFamily="mono" fontSize="sm" color="ink" whiteSpace="nowrap" sx={{ fontVariantNumeric: "tabular-nums" }}>
      {value}
    </Text>
  </Flex>
);

/**
 * Inline deposit / withdraw panel for the pool page (replaces the modal there).
 * Structure: mode tabs → amount card (token, amount, presets, USD value) → details → action.
 */
export const ActionPanel = observer(({ pool }: { pool: IPoolData }) => {
  const { address } = useAccount();
  const [mode, setMode] = useState<Mode>("deposit");
  const [amount, setAmount] = useState("");
  const [feesOpen, setFeesOpen] = useState(false);

  const decimals = pool.decimals;
  const price = pool.tokenPriceInUsd || 1;

  // Wallet balance (demo ledger in demo mode, on-chain otherwise).
  const { data: chainBalance } = useBalance({
    address,
    token: pool.tokenAddress as `0x${string}`,
    query: { enabled: !DEMO_MODE && !!address }
  });
  const walletBalance = !address
    ? 0
    : DEMO_MODE
      ? demoLedger.walletBalance(pool.token)
      : Number(formatUnits(chainBalance?.value ?? BigInt(0), chainBalance?.decimals ?? decimals));

  const { balance: position } = useBalanceOfAsset(
    pool.rebalancerAddress as `0x${string}`,
    address ?? "0x",
    decimals
  );

  const reset = () => setAmount("");

  const {
    allowance,
    deposit,
    isLoading: depositLoading,
    refetchDepositAllowance
  } = useDeposit(
    pool.rebalancerAddress as `0x${string}`,
    pool.tokenAddress as `0x${string}`,
    reset,
    () => submit(),
    true
  );
  const { instantWithdraw, isLoading: withdrawLoading } = useWithdraw(
    pool.rebalancerAddress as `0x${string}`,
    reset,
    () => submit()
  );

  const value = Number(amount) || 0;
  const available = mode === "deposit" ? walletBalance : position;
  const units = (() => {
    try {
      return parseUnits((amount || "0") as `${number}`, decimals);
    } catch {
      return BigInt(0);
    }
  })();
  const allowanceUnits = allowance ? Number(formatUnits(allowance as bigint, decimals)) : 0;
  const needsApproval = mode === "deposit" && value > 0 && allowanceUnits < value;

  let error = "";
  if (value > 0) {
    if (value > available + 1e-9) error = mode === "deposit" ? "Insufficient wallet balance" : "Amount exceeds your position";
    else if (mode === "deposit" && value < MIN_DEPOSIT) error = `Minimum deposit is ${MIN_DEPOSIT} ${pool.token}`;
  }
  const loading = depositLoading || withdrawLoading;
  const canSubmit = !!address && value > 0 && !error && !loading;

  const submit = () => {
    if (!address || !canSubmit) return;
    if (mode === "deposit") deposit({ value: units, address });
    else instantWithdraw({ address, assets: units });
  };

  const onAmountChange = (raw: string) => {
    const v = raw.replace(",", ".");
    if (v === "" || new RegExp(`^\\d*\\.?\\d{0,${Math.min(decimals, 6)}}$`).test(v)) setAmount(v);
  };
  const setShare = (share: number) => setAmount(available > 0 ? String(floor2(available * share)) : "");

  const apy = pool.avgApr ?? 0;
  const positionAfter = mode === "deposit" ? position + value : Math.max(0, position - value);

  return (
    <Flex direction="column" gap="16px" bg="bg2" borderWidth="1px" borderStyle="solid" borderColor="line" borderRadius="2px" p={{ base: "16px", md: "20px" }}>
      {/* Mode tabs */}
      <Flex role="tablist" aria-label="Action" borderBottom="1px solid" borderColor="line">
        {(["deposit", "withdraw"] as const).map(m => (
          <Box
            key={m}
            as="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              reset();
            }}
            flex="1"
            pb="12px"
            mb="-1px"
            fontSize="md"
            color={mode === m ? "ink" : "ink3"}
            borderBottom="2px solid"
            borderColor={mode === m ? "accent" : "transparent"}
            textTransform="capitalize"
            transition="color 120ms, border-color 120ms"
            _hover={{ color: "ink" }}
          >
            {m}
          </Box>
        ))}
      </Flex>

      {/* Amount */}
      <Flex justify="space-between" align="baseline">
        <Text fontSize="sm" color="ink3">
          {mode === "deposit" ? "You deposit" : "You withdraw"}
        </Text>
        <Tooltip label={mode === "deposit" ? "Wallet balance — click to use max" : "Your position — click to withdraw all"}>
          <Text
            as="button"
            onClick={() => setShare(1)}
            fontFamily="mono"
            fontSize="sm"
            color="ink2"
            borderBottom="1px dashed"
            borderColor="lineStrong"
            _hover={{ color: "ink" }}
          >
            <Text as="span" color="ink3" fontFamily="body" mr="6px">
              {mode === "deposit" ? "Wallet" : "Position"}
            </Text>
            {fmt(available)} {pool.token}
          </Text>
        </Tooltip>
      </Flex>

      <Box
        bg="bg"
        borderWidth="1px"
        borderStyle="solid"
        borderColor={error ? "negAlpha.60" : "lineStrong"}
        borderRadius="2px"
        p="14px"
        transition="border-color 120ms"
        _focusWithin={{ borderColor: error ? "neg" : "accent" }}
      >
        <Flex align="center" gap="12px">
          <Flex align="center" gap="8px" bg="bg3" px="10px" py="8px" borderRadius="2px" flexShrink={0}>
            <TokenIcon name={pool.token} size="24px" sizeIcon="14px" />
            <Text fontSize="md" color="ink">
              {pool.token}
            </Text>
          </Flex>
          <Input
            id={ACTION_AMOUNT_INPUT_ID}
            aria-label={`${mode === "deposit" ? "Deposit" : "Withdraw"} amount in ${pool.token}`}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={amount}
            onChange={e => onAmountChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !needsApproval && submit()}
            textAlign="right"
            fontFamily="mono"
            fontSize={{ base: "26px", md: "30px" }}
            h="48px"
            px="0"
            color="ink"
            border="none"
            bg="transparent"
            _placeholder={{ color: "muted" }}
            _focusVisible={{ boxShadow: "none" }}
            sx={{ fontVariantNumeric: "tabular-nums" }}
          />
        </Flex>
        <Flex mt="12px" justify="space-between" align="center" gap="8px">
          <Flex gap="6px">
            {[0.25, 0.5, 0.75, 1].map(s => (
              <Button
                key={s}
                size="sm"
                variant="secondaryOutline"
                h="28px"
                px="8px"
                fontSize="10px"
                isDisabled={!address || available <= 0}
                onClick={() => setShare(s)}
              >
                {s === 1 ? "Max" : `${s * 100}%`}
              </Button>
            ))}
          </Flex>
          <Text fontFamily="mono" fontSize="sm" color="ink3">
            ${fmt(value * price)}
          </Text>
        </Flex>
      </Box>
      {error ? (
        <Text fontSize="xs" color="neg" mt="-8px">
          {error}
        </Text>
      ) : null}

      {/* Details */}
      <Flex direction="column" gap="10px" borderWidth="1px" borderStyle="solid" borderColor="line" borderRadius="2px" p="14px">
        <Text textStyle="eyebrow">{mode === "deposit" ? "Deposit details" : "Withdraw details"}</Text>
        {mode === "deposit" ? (
          <>
            <Row label="30D avg APY" value={`${apy.toFixed(2)}%`} />
            <Row
              label="Est. yearly yield"
              value={value > 0 ? `${fmt(value * (apy / 100))} ${pool.token}` : "—"}
              hint="Projected from the 30-day average APY. Rates are variable; this is not a quote."
            />
            <Row label={`Position, ${pool.token}`} value={`${fmt(position)} → ${fmt(positionAfter)}`} />
            <Row label="Minimum deposit" value={`${MIN_DEPOSIT} ${pool.token}`} />
          </>
        ) : (
          <>
            <Row label="Your position" value={`${fmt(position)} ${pool.token}`} />
            <Row label="Position after" value={`${fmt(positionAfter)} ${pool.token}`} />
            <Row label="You receive" value={value > 0 ? `${fmt(value)} ${pool.token}` : "—"} hint="Execution depends on market liquidity and contract state; withdrawals can be paused." />
          </>
        )}
        <Box h="1px" bg="line" my="4px" />
        <Flex as="button" align="center" gap="8px" onClick={() => setFeesOpen(o => !o)} aria-expanded={feesOpen} color="ink2" _hover={{ color: "ink" }}>
          <Text as="span" fontFamily="mono" fontSize="xs" transform={feesOpen ? "rotate(90deg)" : undefined} transition="transform 120ms">
            ›
          </Text>
          <Text fontSize="sm">Fees</Text>
        </Flex>
        <Collapse in={feesOpen} animateOpacity>
          <Flex direction="column" gap="10px" pt="4px">
            <Row label="Performance fee" value={`${PERFORMANCE_FEE * 100}% of yield`} hint="Charged on generated yield only — never on principal." />
            <Row label="Est. network fee" value={`${NETWORK_FEE_ETH} ETH`} />
          </Flex>
        </Collapse>
      </Flex>

      {/* Action */}
      {!address ? (
        <ConnectWallet variant="primaryWhite" />
      ) : needsApproval && !error ? (
        <Flex direction="column" gap="6px">
          <ApproveBtn
            tokenAddress={pool.tokenAddress as `0x${string}`}
            poolAddress={pool.rebalancerAddress as `0x${string}`}
            value={units}
            setConfirmedApprove={() => refetchDepositAllowance()}
            variant="primaryWhite"
            h="48px"
          />
          <Text fontFamily="mono" fontSize="10px" color="ink3" textAlign="center" letterSpacing="0.12em">
            STEP 1 OF 2 · APPROVE {pool.token}, THEN DEPOSIT
          </Text>
        </Flex>
      ) : (
        <Button variant="primaryWhite" h="48px" w="100%" isDisabled={!canSubmit} isLoading={loading} onClick={submit}>
          {mode === "deposit" ? "Deposit" : "Withdraw"}
        </Button>
      )}
      {DEMO_MODE && address ? (
        <Text fontFamily="mono" fontSize="10px" color="ink3" textAlign="center" letterSpacing="0.12em">
          DEMO · SIMULATED TRANSACTIONS
        </Text>
      ) : null}
    </Flex>
  );
});
