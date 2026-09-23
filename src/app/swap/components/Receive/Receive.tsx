"use client";

import { Box, InputGroup, Skeleton, Text } from "@chakra-ui/react";
import Select from "../ui/Select";
import AmountInput from "../ui/AmountInput";
import { useEffect, useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { useGetTokenList } from "@/api/tokens";
import { IToken } from "@/api/tokens/types";
import { ABI_REBALANCE } from "@/abi/rebalance";
import { formatUnits } from "ethers";
import { formatNumber } from "@/utils/formatNumber";

const contracts = (tokens: IToken[], address: `0x${string}` | undefined) => {
  return tokens?.map(token => ({
    address: token.address as `0x${string}`,
    abi: ABI_REBALANCE,
    functionName: "balanceOf",
    args: [address]
  }));
};

const Receive = ({
  selected,
  setSelected,
  amount,
  setAmount,
  price,
  excludeToken,
  isSuccessSwap,
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

  const availableTokens = useMemo(() => {
    if (!tokenListQuery.data) return [];
    const tokensInWalletSymbols = new Set(tokensInMyWallet.map(token => token.symbol));
    // const filteredTokens = tokenListQuery.data.filter(token => !tokensInWalletSymbols.has(token.symbol));
    const filteredTokens = tokenListQuery.data;
    if (excludeToken) {
      return filteredTokens.filter(token => token.symbol !== excludeToken.symbol);
    }
    return filteredTokens;
  }, [tokenListQuery.data, tokensInMyWallet, excludeToken]);

  useEffect(() => {
    if (
      availableTokens.length > 0 &&
      (!selected || !availableTokens.find(token => token.symbol === selected?.symbol))
    ) {
      setSelected(availableTokens[0]);
    }
  }, [availableTokens]);

  const selectedTokenBalance = useMemo(() => {
    const token = tokensInMyWallet.find(token => token.symbol === selected?.symbol);
    return token ? Number(token.value).toFixed(6) : "0.000000";
  }, [tokensInMyWallet, selected, isSuccessSwap]);

  return (
    <InputGroup borderColor="transparent" data-group zIndex={1} isolation="unset">
      <Box
        background="bg"
        p="20px 24px"
        width="100%"
        borderRadius="2px"
        mt={2}
        border="1px solid"
        borderColor="transparent"
        transition="all .3s ease-in-out"
        _groupFocusWithin={{
          border: "1px solid",
          borderColor: "accentAlpha.60"
        }}
      >
        <Text fontSize="12px" color="gray">
          You receive
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
            options={availableTokens}
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
            <Text textStyle="textMono10">
              Balance: {formatNumber(selectedTokenBalance)} {selected?.symbol}
            </Text>
          )}
        </Box>
      </Box>
    </InputGroup>
  );
};

export default Receive;
