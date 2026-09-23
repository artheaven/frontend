import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ABI_REBALANCE } from "../abi/rebalance";
import { ARB_CONFIRMATIONS_COUNT, BSC_CONFIRMATIONS_COUNT, LOCAL_STORAGE_KEYS } from "@/consts";
import { useStore } from "./useStoreContext";
import { ModalContextEnum } from "@/store/modal/types";
import localStore from "@/utils/localStore";
import { useAnalyticsEventTracker } from "./useAnalyticsEventTracker";
import { arbitrum } from "viem/chains";
import { getChainNameById, getConfirmationsCount } from "@/utils";
import { DEMO_MODE } from "@/demo/config";
import { demoLedger } from "@/demo/ledger";
import { DEMO_POOLS } from "@/demo/data";
import { parseUnits } from "viem";

const demoPool = (vault: string) => DEMO_POOLS.find(p => p.vaultAddress.toLowerCase() === vault.toLowerCase());

export const useDeposit = (
  poolAddress: `0x${string}`,
  tokenAddress: `0x${string}`,
  onClose: VoidFunction,
  onRetry?: VoidFunction,
  needClose?: boolean,
  refetchAllowance?: VoidFunction
) => {
  const [isLoading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { address, chainId } = useAccount();
  const { openModal } = useStore("modalContextStore");
  const isActiveTutorial = !localStore.getData(LOCAL_STORAGE_KEYS.isShownTutorial) || false;
  const { writeContractAsync } = useWriteContract();
  const { activeChain } = useStore("poolsStore");
  const { data: allowance, refetch: refetchDepositAllowance } = useReadContract({
    address: tokenAddress,
    abi: ABI_REBALANCE,
    functionName: "allowance",
    args: [address ?? "0x", poolAddress],
    query: { enabled: !DEMO_MODE }
  });
  const pool = DEMO_MODE ? demoPool(poolAddress) : undefined;
  // Read inside the (observer) caller's render, so it updates after a demo approve.
  const demoAllowance = pool ? parseUnits(demoLedger.allowance(poolAddress).toFixed(pool.tokenDecimals), pool.tokenDecimals) : undefined;

  const {
    isLoading: waitingReceipt,
    isSuccess: isReceiptSuccess,
    isError: isReceiptError,
    error: receiptError
  } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    confirmations: getConfirmationsCount(activeChain)
  });

  const event = useAnalyticsEventTracker();

  const onSendSuccessDepositEvent = () => {
    event({
      action: "deposit_success",
      label: "Deposit Succesful"
    });
  };

  useEffect(() => {
    if (isReceiptSuccess && txHash && chainId) {
      if (needClose) {
        onClose();
        onSendSuccessDepositEvent();
        openModal({
          type: ModalContextEnum.Success,
          props: {
            txHash,
            id: "deposit_success",
            chainName: getChainNameById(chainId)
          }
        });
      }
      setIsSuccess(true);
    } else if (isReceiptError && receiptError) {
      openModal({
        type: ModalContextEnum.Reject,
        props: {
          title: "Transaction error",
          content: receiptError.message,
          onRetry: onRetry ? onRetry : () => {}
        }
      });
    }
  }, [isReceiptSuccess, isReceiptError, txHash, receiptError]);

  const deposit = async ({ value, address }: { value: bigint; address: `0x${string}` }) => {
    if (DEMO_MODE && pool) {
      try {
        setLoading(true);
        const hash = await demoLedger.deposit(poolAddress, pool.token, Number(value) / 10 ** pool.tokenDecimals);
        setLoading(false);
        setIsSuccess(true);
        if (needClose) {
          onClose();
          onSendSuccessDepositEvent();
          openModal({ type: ModalContextEnum.Success, props: { txHash: hash, id: "deposit_success", chainName: activeChain } });
        }
      } catch (e) {
        setLoading(false);
        openModal({
          type: ModalContextEnum.Reject,
          props: { title: "Transaction error", content: (e as Error).message, onRetry: onRetry ?? (() => {}) }
        });
      }
      return;
    }
    try {
      setLoading(true);
      const tx = await writeContractAsync({
        address: poolAddress,
        abi: ABI_REBALANCE,
        functionName: "deposit",
        args: [value, address]
      });
      setTxHash(tx);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const approve = async ({
    value,
    tokenAddress
  }: {
    value: bigint;
    tokenAddress: `0x${string}`;
  }) => {
    try {
      setLoading(true);
      await writeContractAsync({
        address: tokenAddress,
        abi: ABI_REBALANCE,
        functionName: "approve",
        args: [poolAddress, value]
      });
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return {
    allowance: DEMO_MODE ? demoAllowance : allowance,
    deposit,
    approve,
    isLoading: isLoading || waitingReceipt,
    isSuccess,
    refetchDepositAllowance: DEMO_MODE ? () => {} : refetchDepositAllowance
  };
};
