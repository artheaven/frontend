import {
  Divider,
  Flex,
  HStack,
  IconButton,
  Link,
  StackDivider,
  Text,
  useMediaQuery
} from "@chakra-ui/react";
import React, { useState } from "react";

import { CircularProgress } from "../../../components/circular-progress";
import Icon from "../../../components/icon";
import { ICON_NAMES, MEDIA_QUERY_MAX } from "../../../consts";
import { Strategies } from "./components/Strategies";
import NextLink from "next/link";
import { useAccount } from "wagmi";
import { observer } from "mobx-react-lite";
import { useStore } from "@/hooks/useStoreContext";

interface IPoolsHeaderProps {
  isTable: boolean;
  onChangeView: VoidFunction;
}

export const PoolsHeader = observer(({ isTable, onChangeView }: IPoolsHeaderProps) => {
  const { chain } = useAccount();
  const [media] = useMediaQuery(MEDIA_QUERY_MAX);
  const [isDesktop] = useMediaQuery("(min-width: 1130px)");
  const { activeChain } = useStore("poolsStore");
  const [resetCountDown, setResetCountDown] = useState(false);
  const getBridgeLink = () => {
    if (activeChain === "BSC") {
      return "https://www.bnbchain.org/en/bnb-chain-bridge";
    }

    if (activeChain === "Base") {
      return "https://bridge.base.org/deposit";
    }

    return "https://bridge.arbitrum.io/?destinationChain=arbitrum-one&sourceChain=ethereum";
  };

  const onResetCountDown = () => {
    setResetCountDown(true);
    setTimeout(() => {
      setResetCountDown(false);
    }, 100);
  };

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Flex gap="20px" w={media ? "100%" : "auto"}>
        <Strategies onResetCountDown={onResetCountDown} />
        <Link
          ml="auto"
          as={NextLink}
          // as={Flex}
          display="flex"
          href={getBridgeLink()}
          alignItems="center"
          gap="8px"
          fontSize="sm"
          color="whiteAlpha.70"
          isExternal
        >
          Bridge to {activeChain}
          {/* <Icon name={ICON_NAMES.link} color="#5C6470" size="sm" /> */}
          {!media && <Icon name={ICON_NAMES.link} size="sm" />}
        </Link>
      </Flex>
      <HStack
        fontSize="sm"
        color="ink3"
        divider={<StackDivider borderColor="lineStrong" />}
      />
      <Flex gap="20px" align="center">
        {isDesktop && (
          <IconButton
            aria-label="switch"
            size="sm"
            icon={
              <Icon name={isTable ? ICON_NAMES.tiles : ICON_NAMES.menu} onClick={onChangeView} />
            }
          />
        )}

        {!media && <CircularProgress resetCountDown={resetCountDown} />}
      </Flex>
    </Flex>
  );
});
