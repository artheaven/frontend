"use client";

import { Button, Divider, Flex, HStack, Text } from "@chakra-ui/react";
import { useFormik } from "formik";
import { observer } from "mobx-react-lite";
import React, { FC, useEffect, useState } from "react";
import * as yup from "yup"; // Импорт Yup для схемы валидации

import { FormInput } from "../../../../components/forms/form-input";
import { useWithdraw } from "../../../../hooks/useWithdraw";
import { formatBigNumber, parseBigNumber } from "../../../../utils/formatBigNumber";
import { formatNumber } from "../../../../utils/formatNumber";
import { getPersonalEarnings } from "@/api/pools/queries";
import { LockApi } from "@/types";
import { getLocks } from "@/api/points/queries";
import UnlockItem from "./UnlockItem";
import { getDaysLeft, isUnlocked } from "@/utils";
import { useAccount } from "wagmi";
import { useStore } from "@/hooks/useStoreContext";

interface IWithdrawTabProps {
  pool: any;
  balance: number;
  address: `0x${string}`;
  onClose: () => void;
}

const withdrawSchema = yup.object({
  withdraw: yup
    .number()
    .required("Required")
    .positive("Must be positive")
    .max(yup.ref("balance"), "Cannot withdraw more than the available balance")
});

export const WithdrawTab: FC<IWithdrawTabProps> = observer(
  ({ pool, balance, address, onClose }) => {
    const { chain } = useAccount();
    const [profit, setProfit] = useState(0);
    const [unlockData, setUnlockData] = useState<LockApi>({} as LockApi);
    const [totalLockedBalance, setTotalLockedBalance] = useState(0);
    const [isSuccessUnlocked, setIsSuccessUnlocked] = useState(false);
    const [lockIds, setLockIds] = useState<number[]>([]);
    const { activeChain } = useStore("poolsStore");

    useEffect(() => {
      if (address) {
        getLocks(address, pool.token).then(data => {
          const _locks = data.map(lock => lock.lockId);
          setLockIds(_locks);

          const amountsBigInt = data.map(lock => lock.amount);
          const totalLockedAmount = amountsBigInt.reduce(
            (acc, el) => acc + +formatBigNumber(el, pool.decimals),
            0
          );
          setTotalLockedBalance(totalLockedAmount);

          setUnlockData(data[data.length - 1]);
        });
      }
    }, [address, isSuccessUnlocked]);

    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (isSuccessUnlocked) {
        timer = setTimeout(() => {
          setIsSuccessUnlocked(false);
        }, 300);
      }

      return () => {
        clearTimeout(timer);
      };
    }, [isSuccessUnlocked]);

    const formik = useFormik({
      initialValues: {
        withdraw: ""
      },
      validationSchema: withdrawSchema.clone().shape({
        balance: yup.number().default(balance)
      }),
      onSubmit: async values => {
        try {
          const assets = parseBigNumber(values.withdraw || "0", pool.decimals);
          await instantWithdraw({ address, assets });
        } catch (error) {
          console.error("", error);
        }
      }
    });

    const { instantWithdraw, isLoading } = useWithdraw(
      pool.rebalancerAddress,
      () => onClose(),
      formik.handleSubmit
    );

    const setMax = () => {
      const floorBalance = (Math.floor(balance * 100) / 100).toString();

      formik.setFieldValue("withdraw", floorBalance);
      formik.validateField("withdraw");
    };

    useEffect(() => {
      if (address) {
        getPersonalEarnings(1, 30, address, pool.token, activeChain)
          .then(data => {
            setProfit(data.userEarned.reduce((acc, el) => acc + el.uv, 0) || 0);
          })
          .catch(e => {
            console.log(e, "error");
          });
      }
    }, [address, pool.rebalancerAddress]);

    return (
      <form onSubmit={formik.handleSubmit}>
        <Flex direction="column" gap="24px">
          <FormInput
            id="withdraw"
            name="withdraw"
            isValid={formik.isValid}
            errorMessage={formik.errors.withdraw}
            value={formik.values.withdraw}
            handleChange={formik.handleChange}
            tokenName={pool.token}
          />
          <HStack justify="space-between">
            <Text color="black.0">Your deposit</Text>
            <Text textStyle="textMono16">${formatNumber(balance, true)}</Text>
          </HStack>

          {/* <HStack justify="space-between">
            <Text color="black.0">Use as collateral</Text>
            <Text>-</Text>
          </HStack> */}

          <HStack justify="space-between">
            <Text color="black.0">Available to withdraw</Text>
            <Flex align="inherit">
              <Text textStyle="textMono16">${formatNumber(+balance, true)}</Text>
              <Button color="accent" fontFamily="mono" fontSize="xs" textTransform="uppercase" letterSpacing="0.12em" ml="8px" onClick={() => setMax()}>
                Max
              </Button>
            </Flex>
          </HStack>

          <Divider borderColor="black.90" />

          {unlockData && unlockData.lockId >= 0 && (
            <UnlockItem
              daysRemain={getDaysLeft(unlockData.unlockTime, unlockData.duration)}
              pointsEarned={0}
              isFreezeEnd={isUnlocked(unlockData.unlockTime)}
              lockIds={lockIds}
              onSuccessUnlock={() => setIsSuccessUnlocked(true)}
              amount={totalLockedBalance}
              token={unlockData.token}
            />
          )}

          <HStack justify="space-between">
            <Text color="black.0">30D profit</Text>
            <Text textStyle="textMono16">${formatNumber(profit)}</Text>
          </HStack>

          <HStack justify="space-between">
            <Text color="black.0">Gas fee</Text>
            <Text textStyle="textMono16">{formatNumber(0.000005)} (ETH)</Text>
          </HStack>

          <Button
            variant="primaryFilled"
            type="submit"
            isDisabled={!formik.values.withdraw || !formik.isValid}
            isLoading={isLoading}
          >
            Withdraw
          </Button>
        </Flex>
      </form>
    );
  }
);
