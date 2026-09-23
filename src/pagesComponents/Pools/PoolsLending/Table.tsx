"use client";

import {
  Flex,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  Text,
  Skeleton,
  useMediaQuery,
  Image
} from "@chakra-ui/react";
import { IPoolData } from "../types";
import { Risk } from "@/components/risk";
import { TokenIcon } from "@/components/token-icon";
import { formatNumber } from "@/utils/formatNumber";
import DepositInfo from "./components/DepositInfo";
import { useAccount } from "wagmi";
import UserProfitPool from "./components/UserProfitPool";
import { DepositLendingButton } from "@/features/actions/deposit-or-withdraw-button/DepositLendingButton";
import { WithdrawLendingButton } from "@/features/actions/deposit-or-withdraw-button/WithdrawLendingButton";
import { generatePath } from "react-router-dom";
import { ROUTE_PATHS } from "@/consts/routes";
import { useRouter } from "next/navigation";
import ArbIncentive from "@/components/badge/ArbIncentive";
import { getIdByToken } from "@/utils/analytics";
import { observer } from "mobx-react-lite";
import { useStore } from "@/hooks/useStoreContext";

interface PoolsLendingTableProps {
  pools: IPoolData[];
  isLoading: boolean;
  error?: string | null;
}

const PoolsLendingTable = observer(({ pools, isLoading, error }: PoolsLendingTableProps) => {
  const { address } = useAccount();
  const router = useRouter();
  const [isNotDesktop] = useMediaQuery("(max-width: 1024px)");
  const { activeChain } = useStore("poolsStore");

  const getChainRouteName = () => {
    switch (activeChain) {
      case "Base":
        return "base";
      case "BSC":
        return "bsc";
      default:
        return "arb";
    }
  };

  const getTitle = (token: string) => {
    if (activeChain === "Base" && token === "USDC") {
      return "Morpho USDC";
    }

    return token;
  };

  const handleLink = (poolToken: string) => {
    // router.push(generatePath(ROUTE_PATHS.lendingAsset, { poolToken }));
    router.push(ROUTE_PATHS.lendingAssetPage(getChainRouteName(), poolToken), { scroll: false });
  };

  if (isLoading || error) {
    return (
      <Flex flexDir="column" gap={4}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} height="65px" />
        ))}
      </Flex>
    );
  }

  return (
    <TableContainer>
      <Table variant="simple" id="pools">
        <Thead>
          <Tr color="white">
            <Th maxW="136px" p="16px 12px 16px 32px" textTransform="unset">
              <Text textStyle="text14">Asset name</Text>
            </Th>
            <Th maxW="118px" p="16px 12px">
              <Text textStyle="text14" textTransform="capitalize">
                Risk factor
              </Text>
            </Th>
            <Th maxW="118px" p="16px 12px" textTransform="unset">
              <Text textStyle="text14">Funds in pool</Text>
            </Th>
            <Th maxW="118px" p="16px 12px">
              <Text textStyle="text14" textTransform="capitalize">
                Profit Earned
              </Text>
            </Th>
            <Th maxW="118px" p="16px 12px" textTransform="unset">
              <Text textStyle="text14">30D avg. APY</Text>
            </Th>
            <Th maxW="118px" p="16px 12px" textTransform="unset">
              <Text
                textStyle="text14"
                sx={{
                  textWrap: "balance"
                }}
              >
                % APY {">"} market avg.
              </Text>
            </Th>
            <Th maxW="118px" p="16px 12px" textTransform="unset">
              <Text textStyle="text14">My deposit</Text>
            </Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {pools.map(pool => (
            <Tr
              id={`Click_page_${getIdByToken(pool.token)}`}
              key={pool.tokenAddress}
              onClick={() => handleLink(pool.token)}
              cursor="pointer"
              transition="all .3s"
              _hover={{
                bg: "black.80"
              }}
            >
              <Th p="24px 12px 24px 32px">
                <Flex gap={1.5} alignItems="center">
                  <TokenIcon name={pool.token} size="34px" sizeIcon="18px" />
                  <Flex flexDir="column" gap={2}>
                    <Text textStyle="h2" fontWeight={500} color="white" textTransform="capitalize">
                      {getTitle(pool.token)}
                    </Text>
                  </Flex>
                </Flex>
              </Th>
              <Th p="24px 12px">
                <Risk risk={pool.risk} />
              </Th>
              <Th p="24px 12px">
                <Text
                  textStyle="textMono16"
                  color="white"
                  borderBottom="1px dashed white"
                  w="max-content"
                >
                  {formatNumber(pool.funds)}
                </Text>
              </Th>
              <Th p="24px 12px">
                <Text textStyle="textMono16" color="white">
                  {address && <UserProfitPool address={address} token={pool.token} noSymbol />}
                </Text>
              </Th>
              <Th p="24px 12px">
                <Flex flexDir="column" gap={1}>
                  <Text textStyle="textMono16" color="white">
                    {formatNumber(pool.avgApr)}%
                  </Text>
                </Flex>
              </Th>
              <Th p="24px 12px">
                <Text
                  textStyle="textMono16"
                  color={
                    pool.avgApr > 0 ? "pos" : pool.avgApr < 0 ? "neg" : "ink"
                  }
                >
                  {pool.avgApr > 0 ? "+" : pool.avgApr < 0 ? "-" : ""}
                  {formatNumber(pool.apr)}%
                </Text>
              </Th>
              <Th p="24px 12px">
                {address ? (
                  <DepositInfo
                    contractAddress={pool.rebalancerAddress as `0x${string}`}
                    ownerAddress={address}
                    tokenName={pool?.token}
                    decimals={pool.decimals}
                    noTitle
                    noSymbol
                    TextProps={{
                      color: "white"
                    }}
                  />
                ) : (
                  <Text textStyle="textMono16" color="white">
                    0
                  </Text>
                )}
              </Th>
              <Th minW="200px" p="24px 32px 24px 12px" display="flex" gap={2}>
                <DepositLendingButton
                  pool={pool}
                  minHeight="40px"
                  ButtonProps={{
                    flex: 1
                  }}
                  id={
                    address
                      ? `Click_Deposit_${getIdByToken(pool.token)}`
                      : `Click_Deposit_start_${getIdByToken(pool.token)}`
                  }
                />
                <WithdrawLendingButton
                  pool={pool}
                  minHeight="40px"
                  ButtonProps={{
                    flex: 1
                  }}
                />
              </Th>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
});

export default PoolsLendingTable;
