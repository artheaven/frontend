"use client";
import { Box, Button, Flex, Text, useMediaQuery } from "@chakra-ui/react";
import Header from "./components/Header/Header";
import Pay from "./components/Pay/Pay";
import Receive from "./components/Receive/Receive";
import Fee from "./components/Fee/Fee";
import {
  ARB_TOKEN,
  BALANCE_ERROR,
  ICON_NAMES,
  PARASWAP_SPENDER_ADDRESS,
  USDT_TOKEN
} from "@/consts";
import Icon from "@/components/icon";
import { useAccount, useEstimateFeesPerGas, useReadContract, useSwitchChain } from "wagmi";
import { ConnectWallet } from "@/features/ConnectWallet";
import { useState, useEffect } from "react";
import { IToken } from "@/api/tokens/types";
import { useGetTokenList } from "@/api/tokens";
import { useGetPrice } from "@/api/swap";
import { formatBigNumber } from "@/utils/formatBigNumber";
import { erc20Abi } from "viem";
import ApproveButton from "@/components/button/ApproveButton";
import { performApprovedAmountValue } from "@/utils";
import SwapButton from "@/components/button/SwapButton";
import { AddressType } from "@/types";
import { getApiError } from "@/utils/handlers";
import { defChainIdArbitrum } from "@/hooks/useAuth";
import useDebounce from "@/hooks/useDebounce";
import { parseUnits } from "ethers";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { mainnet } from "viem/chains";

const Swap = () => {
  const searchParams = useSearchParams();
  const { address, chainId, connector } = useAccount();
  const { switchChain } = useSwitchChain();
  const [payToken, setPayToken] = useState<IToken | null>(null);
  const [receiveToken, setReceiveToken] = useState<IToken | null>(null);
  const [payAmount, setPayAmount] = useState("1.00");
  const [receiveAmount, setReceiveAmount] = useState("0.00");
  const [error, setError] = useState<string>("");
  const [isSuccessSwap, setIsSuccessSwap] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<string>("");
  const [gasFee, setGasFee] = useState<string>("");
  const [isPayInputChanged, setIsPayInputChanged] = useState(true);
  const [isReceiveInputChanged, setIsReceiveInputChanged] = useState(false);
  const [isMobile] = useMediaQuery("(max-width: 480px)");

  const queryInputTokenAddress = searchParams.get("input");
  const queryOutputTokenAddress = searchParams.get("output");

  const { data: tokenList } = useGetTokenList(chainId ?? defChainIdArbitrum);

  const payTokenDecimals = payToken?.decimals ?? 18;
  const receiveTokenDecimals = receiveToken?.decimals ?? 18;

  const debouncedPayAmount = useDebounce(Number(payAmount), 300);
  const debouncedReceiveAmount = useDebounce(Number(receiveAmount), 300);

  const { data: approvedAmount, refetch: refetchAllowance } = useReadContract({
    address: (payToken?.address as `0x${string}`) || "",
    abi: erc20Abi,
    chainId,
    functionName: "allowance",
    args: [address as `0x${string}`, PARASWAP_SPENDER_ADDRESS as `0x${string}`],
    query: {
      enabled: payAmount !== "0.00"
    }
  });

  const approvedAmountValue = performApprovedAmountValue(approvedAmount, payTokenDecimals);

  const {
    data: receiveTokenPriceData,
    error: receiveTokenPriceError,
    isLoading: isLoadingReceiveTokenPrice,
    isFetched: isReceiveTokenPriceFetched
  } = useGetPrice(
    receiveToken?.address,
    payToken?.address,
    debouncedReceiveAmount,
    chainId ?? defChainIdArbitrum,
    receiveTokenDecimals,
    payTokenDecimals,
    isReceiveInputChanged
  );

  const {
    data: payTokenPriceData,
    error: payTokenPriceError,
    refetch,
    isLoading: isLoadingPayTokenPrice
  } = useGetPrice(
    payToken?.address,
    receiveToken?.address,
    debouncedPayAmount,
    chainId ?? defChainIdArbitrum,
    payTokenDecimals,
    receiveTokenDecimals,
    isPayInputChanged
  );

  const feePerGas = useEstimateFeesPerGas({
    chainId: chainId ?? defChainIdArbitrum
  });

  useEffect(() => {
    if (chainId !== mainnet.id) {
      switchChain({
        chainId: mainnet.id
      });
    }
  }, [chainId]);

  useEffect(() => {
    if (tokenList && tokenList.length > 1 && !payToken && !receiveToken) {
      if (queryInputTokenAddress && queryOutputTokenAddress) {
        setPayToken(tokenList.find(token => token.address === queryInputTokenAddress) || ARB_TOKEN);
        setReceiveToken(
          tokenList.find(token => token.address === queryOutputTokenAddress) || USDT_TOKEN
        );
      } else {
        setPayToken(
          tokenList.find(token => token.symbol === "ARB") ??
            tokenList.find(token => token.symbol === "WETH") ??
            ARB_TOKEN
        );
        setReceiveToken(tokenList.find(token => token.symbol === "USDT") || USDT_TOKEN);
      }
    }
  }, [tokenList, payToken, receiveToken]);

  useEffect(() => {
    if (payTokenPriceData) {
      // @ts-ignore
      const srcAmount = BigInt(payTokenPriceData.priceRoute.srcAmount);
      // @ts-ignore
      const destAmount = BigInt(payTokenPriceData.priceRoute.destAmount);
      const rate =
        (Number(destAmount) * 10 ** payTokenDecimals) /
        (Number(srcAmount) * 10 ** receiveTokenDecimals);
      setExchangeRate(`1 ${payToken?.symbol} = ${rate.toFixed(6)} ${receiveToken?.symbol}`);
      // @ts-ignore
      const maxFeePerGasInWei = parseUnits(feePerGas.data?.formatted.maxFeePerGas, "gwei");
      // @ts-ignore
      const gasCostInWei = BigInt(payTokenPriceData.priceRoute.gasCost) * maxFeePerGasInWei;

      const gasCostInEth = Number(gasCostInWei) / 1e18;
      setGasFee(
        gasCostInEth > 0 && gasCostInEth < 0.000001
          ? "<0.000001 ETH"
          : `${gasCostInEth.toFixed(6)} ETH`
      );
    }
  }, [payTokenPriceData, payToken, receiveToken, payTokenDecimals, receiveTokenDecimals]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isSuccessSwap) {
      handleResetInputs();
      timer = setTimeout(() => {
        setIsSuccessSwap(false);
      }, 3000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isSuccessSwap]);

  useEffect(() => {
    const newError = payTokenPriceError || receiveTokenPriceError;
    if (newError) {
      setError(getApiError(newError));
    } else if (!newError && error) {
      setError("");
    }
  }, [payTokenPriceError, receiveTokenPriceError]);

  useEffect(() => {
    if (payTokenPriceData) {
      setReceiveAmount(
        Number(
          formatBigNumber(
            // @ts-ignore
            BigInt(payTokenPriceData.priceRoute.destAmount),
            // @ts-ignore
            payTokenPriceData.priceRoute.destDecimals
          )
        ).toFixed(6)
      );
    }
  }, [payTokenPriceData]);

  useEffect(() => {
    if (receiveTokenPriceData) {
      setPayAmount(
        Number(
          formatBigNumber(
            // @ts-ignore
            BigInt(receiveTokenPriceData.priceRoute.destAmount),
            // @ts-ignore
            receiveTokenPriceData.priceRoute.destDecimals
          )
        ).toFixed(6)
      );
    }
  }, [receiveTokenPriceData]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPayInputChanged) {
      timer = setTimeout(() => {
        setIsPayInputChanged(false);
      }, 1000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isPayInputChanged]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isReceiveInputChanged) {
      timer = setTimeout(() => {
        setIsReceiveInputChanged(false);
      }, 1000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isReceiveInputChanged]);

  const payTokenPrice =
    Number(payAmount) > 0 && payTokenPriceData
      ? // @ts-ignore
        Number(payTokenPriceData?.priceRoute?.srcUSD).toFixed(6) || 0
      : Number(payAmount) > 0 && receiveTokenPriceData
      ? // @ts-ignore
        Number(receiveTokenPriceData?.priceRoute?.srcUSD).toFixed(6) || 0
      : 0;

  const receiveTokenPrice =
    Number(receiveAmount) > 0 && payTokenPriceData
      ? // @ts-ignore
        Number(payTokenPriceData?.priceRoute?.destUSD).toFixed(6)
      : Number(receiveAmount) > 0 && receiveTokenPriceData
      ? // @ts-ignore
        Number(receiveTokenPriceData?.priceRoute?.destUSD).toFixed(6)
      : 0;

  const handlePayInputChange = (value: string) => {
    setIsPayInputChanged(true);
    setError("");
    setPayAmount(value);
    refetchAllowance();
  };

  const handleReceiveInputChange = (value: string) => {
    setIsReceiveInputChanged(true);
    setError("");
    setReceiveAmount(value);
  };

  const handleSelectPayToken = (token: IToken) => {
    if (!payAmount || payAmount === "0.00") {
      setPayAmount("1.00");
    }
    setPayToken(token);
    setReceiveAmount("0.00");
    setGasFee("");
    setExchangeRate("");
  };

  const handleSelectReceiveToken = (token: IToken) => {
    if (!payAmount || payAmount === "0.00") {
      setPayAmount("1.00");
    }
    setReceiveToken(token);
    setReceiveAmount("0.00");
    setGasFee("");
    setExchangeRate("");
  };

  const handleSwapTokens = () => {
    const tempToken = payToken;
    const tempAmount = payAmount;
    setPayToken(receiveToken);
    setReceiveToken(tempToken);
    setPayAmount(receiveAmount);
    setReceiveAmount(tempAmount);
    setGasFee("");
    setExchangeRate("");
  };

  const handleResetInputs = () => {
    setPayAmount("1.00");
    setReceiveAmount("0.00");
  };

  const isNeedApprove = Number(payAmount) > approvedAmountValue;
  const isSwapDisabled = isNeedApprove;
  const isLoadingFee = !gasFee || !exchangeRate;

  return (
    <Flex flexDir="column" gap="20px" m="60px auto auto">
      <Box
        borderRadius="2px"
        minW={isMobile ? "350px" : "460px"}
        mx={isMobile ? 2 : 0}
        background="bg2"
        p="24px 20px"
      >
        <Header onRefetch={refetch} />
        <Box position="relative" mt={3}>
          <Box
            cursor="pointer"
            backgroundColor="bg2"
            borderRadius="2px"
            padding="16px"
            position="absolute"
            top="52%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={3}
            onClick={handleSwapTokens}
          >
            <Icon name={ICON_NAMES.swap} />
          </Box>
          <Pay
            selected={payToken}
            setSelected={handleSelectPayToken}
            amount={payAmount}
            setAmount={handlePayInputChange}
            price={payTokenPrice}
            excludeToken={receiveToken}
            isSuccessSwap={isSuccessSwap}
            onError={setError}
            isLoading={isLoadingReceiveTokenPrice}
          />
          <Receive
            selected={receiveToken}
            setSelected={handleSelectReceiveToken}
            amount={receiveAmount}
            setAmount={handleReceiveInputChange}
            price={receiveTokenPrice}
            excludeToken={payToken}
            isSuccessSwap={isSuccessSwap}
            isLoading={isLoadingPayTokenPrice}
          />
        </Box>
        {error && error !== BALANCE_ERROR && (
          <Text color="red.500" mt={4} textAlign="center">
            {error}
          </Text>
        )}
        {!error && <Fee exchangeRate={exchangeRate} gasFee={gasFee} isLoading={isLoadingFee} />}
        {!address && <ConnectWallet variant="primaryFilled" />}
        {address && chainId !== mainnet.id && (
          <Button
            variant="primaryFilled"
            h="52px"
            w="100%"
            mt={4}
            transition="all .3s"
            _hover={{
              opacity: 0.8,
              background: "transparent",
              color: "white"
            }}
            onClick={() => switchChain({ chainId: mainnet.id })}
          >
            Switch ETH
          </Button>
        )}
        {address && chainId === mainnet.id && (
          <ApproveButton
            amount={Number(payAmount)}
            ownerAddress={address}
            spenderAddress={PARASWAP_SPENDER_ADDRESS}
            tokenAddress={payToken?.address || ""}
            tokenDecimals={payTokenDecimals}
            isDisabled={(!payTokenPriceData && !receiveTokenPriceData) || !!error}
            error={error}
          />
        )}
        {chainId === mainnet.id &&
          !isNeedApprove &&
          !isLoadingPayTokenPrice &&
          !isLoadingReceiveTokenPrice && (
            <SwapButton
              payToken={{
                address: (payToken?.address as AddressType) || ("" as AddressType),
                amount: Number(payAmount),
                decimals: payTokenDecimals
              }}
              receiveToken={{
                address: (receiveToken?.address as AddressType) || ("" as AddressType),
                decimals: receiveTokenDecimals
              }}
              isDisabled={isSwapDisabled}
              onError={setError}
              onSuccess={setIsSuccessSwap}
            />
          )}
      </Box>
      <Flex gap={2} alignItems="center" alignSelf="center">
        <Text fontSize="sm" fontWeight={500} color="gray.400">
          Powered by
        </Text>
        <Image
          src="https://cdn.prod.website-files.com/617aa5e4225be2555942852c/6214d5c4db4ce4d976b5f1f9_logo_paraswap-handbook%20copy%201.svg"
          width={100}
          height={18}
          alt="Paraswap"
        />
      </Flex>
    </Flex>
  );
};

export default Swap;
