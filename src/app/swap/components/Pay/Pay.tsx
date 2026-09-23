"use client";

import { Box, Button, Flex, InputGroup, Skeleton, Text } from "@chakra-ui/react";
import Select from "../ui/Select";
import AmountInput from "../ui/AmountInput";
import { useEffect, useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { useGetTokenList } from "@/api/tokens";
import { IToken } from "@/api/tokens/types";
import { ABI_REBALANCE } from "@/abi/rebalance";
import { formatUnits } from "ethers";
import { formatNumber } from "@/utils/formatNumber";
import { BALANCE_ERROR } from "@/consts";

const contracts = (tokens: IToken[], address: `0x${string}` | undefined) => {
  return tokens?.map(token => ({
    address: token.address as `0x${string}`,
    abi: ABI_REBALANCE,
    functionName: "balanceOf",
    args: [address]
  }));
};

const Pay = ({
  selected,
  setSelected,
  amount,
  setAmount,
  price,
  excludeToken,
  isSuccessSwap,
  onError,
  isLoading
}: any) => {
  const { address, chainId } = useAccount();
  const tokenListQuery = useGetTokenList(chainId || 42161, isSuccessSwap);

  const contractsData = useReadContracts({
    contracts: contracts(tokenListQuery.data || [], address)
  });

  const tokensInMyWallet = useMemo(() => {
    if (!contractsData.data || !tokenListQuery.data) return [];
    return tokenListQuery.data
      .map((token, i) => ({
        ...token,
        value: contractsData.data[i]?.result
          ? formatUnits(contractsData.data[i].result as bigint, token.decimals)
          : "0"
      }))
      .filter(token => Number(token.value) > 0);
  }, [contractsData.data, tokenListQuery.data, isSuccessSwap]);

  const allTokensSorted = useMemo(() => {
    if (!tokenListQuery.data) return [];
    const tokensWithBalance = tokensInMyWallet.map(t => t.symbol);
    const sortedTokens = [
      ...tokensInMyWallet,
      ...tokenListQuery.data.filter(token => !tokensWithBalance.includes(token.symbol))
    ];
    if (excludeToken) {
      return sortedTokens.filter(token => token.symbol !== excludeToken.symbol);
    }
    return sortedTokens;
  }, [tokenListQuery.data, tokensInMyWallet, excludeToken]);

  const selectedTokenBalance = useMemo(() => {
    const token = tokensInMyWallet.find(token => token.symbol === selected?.symbol);
    return token ? Number(token.value).toFixed(6) : "0.000000";
  }, [tokensInMyWallet, selected, isSuccessSwap]);

  useEffect(() => {
    if (
      allTokensSorted.length > 0 &&
      (!selected || !allTokensSorted.find(token => token.symbol === selected.symbol))
    ) {
      setSelected(allTokensSorted[0]);
    }
  }, [allTokensSorted]);

  useEffect(() => {
    if (amount > selectedTokenBalance) {
      onError(BALANCE_ERROR);
    } else {
      onError("");
    }
  }, [amount, selectedTokenBalance]);

  const handleMaxClick = () => {
    setAmount(selectedTokenBalance);
  };

  return (
    <InputGroup borderColor="transparent" isolation="unset">
      <Box
        background="bg"
        p={[5, 6]}
        width="100%"
        borderRadius="2px"
        mt={3}
        data-group
        border="1px solid"
        borderColor="transparent"
        transition="all .3s ease-in-out"
        _groupFocusWithin={{
          border: "1px solid",
          borderColor: "accentAlpha.60"
        }}
      >
        <Text fontSize="12px" color="gray">
          You pay
        </Text>
        <Box mt="12px" display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          {isLoading ? (
            <Skeleton height={10} width="80px" borderRadius="2px" />
          ) : (
            <AmountInput
              amount={amount}
              setAmount={setAmount}
              maxAmount={Number(selectedTokenBalance)}
              textAlign="left"
              fontSize="24px"
              fontWeight={500}
              flex={1}
            />
          )}
          <Select
            options={allTokensSorted}
            value={selected}
            setSelected={setSelected}
            ButtonProps={{
              borderRadius: "20px",
              minWidth: "max-content"
            }}
          />
        </Box>
        <Box mt="12px" display="flex" alignItems="center" justifyContent="space-between">
          {isLoading ? (
            <Skeleton height="15px" width="40px" borderRadius="2px" />
          ) : (
            <Text textStyle="textMono10" color="darkgrey">
              ~${price}
            </Text>
          )}
          {!contractsData.isLoading && address && (
            <Flex gap={1.5} alignItems="center">
              <Text textStyle="textMono10">
                Balance: {formatNumber(selectedTokenBalance)} {selected?.symbol}
              </Text>
              <Button
                color="greenAlpha.100"
                fontSize="10px"
                lineHeight="18px"
                minW={0}
                w="max-content"
                mt={0.5}
                h="18px"
                onClick={handleMaxClick}
              >
                MAX
              </Button>
            </Flex>
          )}
        </Box>
      </Box>
    </InputGroup>
  );
};

export default Pay;
