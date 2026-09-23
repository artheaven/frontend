import { Button } from "@chakra-ui/react";
import { useEffect } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { ABI_REBALANCE } from "../../../../abi/rebalance";
import { ARB_CONFIRMATIONS_COUNT, BSC_CONFIRMATIONS_COUNT } from "@/consts";
import { arbitrum } from "viem/chains";
import { useStore } from "@/hooks/useStoreContext";
import { getConfirmationsCount } from "@/utils";
import { useState } from "react";
import { DEMO_MODE } from "@/demo/config";
import { demoLedger } from "@/demo/ledger";
import { DEMO_POOLS } from "@/demo/data";

const ApproveBtn = ({
  value,
  poolAddress,
  tokenAddress,
  setConfirmedApprove,
  isDisabled,
  id,
  onClick,
  variant = "primaryFilled",
  h
}: {
  value: bigint;
  tokenAddress: `0x${string}`;
  poolAddress: `0x${string}`;
  setConfirmedApprove: (value: boolean) => void;
  isDisabled?: boolean;
  id?: string;
  onClick?: VoidFunction;
  variant?: string;
  h?: string;
}) => {
  const { chainId } = useAccount();
  const { data: hash, writeContract, error } = useWriteContract();
  const { activeChain } = useStore("poolsStore");
  const { isSuccess, isLoading } = useWaitForTransactionReceipt({
    hash,
    confirmations: getConfirmationsCount(activeChain)
  });

  const [demoPending, setDemoPending] = useState(false);

  const approve = () => {
    if (onClick) {
      onClick();
    }

    if (DEMO_MODE) {
      // Demo: approve the exact amount (value is in the pool asset's base units).
      setDemoPending(true);
      const decimals =
        DEMO_POOLS.find(p => p.vaultAddress.toLowerCase() === poolAddress.toLowerCase())?.tokenDecimals ?? 18;
      demoLedger
        .approve(poolAddress, Number(value) / 10 ** decimals)
        .then(() => setConfirmedApprove(true))
        .finally(() => setDemoPending(false));
      return;
    }

    writeContract({
      address: tokenAddress,
      abi: ABI_REBALANCE,
      functionName: "approve",
      args: [poolAddress, value]
    });
  };

  useEffect(() => {
    if (isSuccess) {
      setConfirmedApprove(isSuccess);
    }
  }, [isSuccess]);

  return (
    <Button id={id} variant={variant} h={h} w={h ? "100%" : undefined} isDisabled={isDisabled || demoPending} onClick={() => approve()}>
      {isLoading || demoPending ? "Processing..." : "Approve"}
    </Button>
  );
};

export default ApproveBtn;
