import { Flex, Menu, MenuButton, MenuItem, MenuList, Text, useEditable } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";

import Icon from "../../../../../components/icon";
import { CHAIN_ICONS, ICON_NAMES } from "../../../../../consts";
import { useStore } from "@/hooks/useStoreContext";
import { arbitrum, base, bsc, mainnet } from "viem/chains"; // Added base import
import { observer } from "mobx-react-lite";
import { isMobile } from "react-device-detect";
import { ICHAIN } from "@/types";

type StrategiesProps = {
  onResetCountDown: VoidFunction;
};

export const Strategies = observer(({ onResetCountDown }: StrategiesProps) => {
  const { chains, switchChain } = useSwitchChain();
  const { chain, address, chainId, connector } = useAccount();
  const { activeChain, setActiveChain, resetPools } = useStore("poolsStore");

  // Helper function to get chain ID from active chain name
  const getChainIdFromName = (chainName: string): number => {
    switch (chainName) {
      case "Ethereum":
        return mainnet.id;
      case "BSC":
        return bsc.id;
      case "Base":
        return base.id;
      case "Arbitrum":
      default:
        return mainnet.id;
    }
  };

  // Helper function to get chain name from chain ID
  const getChainNameFromId = (id: number): ICHAIN => {
    if (id === bsc.id) return "BSC";
    if (id === base.id) return "Base";
    if (id === arbitrum.id) return "Arbitrum";
    if (id === mainnet.id) return "Ethereum";
    return "Ethereum"; // Default to Ethereum if not BSC or Base
  };

  const [activeChainId, setActiveChainId] = useState(chainId || getChainIdFromName(activeChain));
  const isMagicActive = connector?.id === "magic";

  useEffect(() => {
    if (chainId) {
      setActiveChainId(chainId);
    }
  }, [activeChain, chainId]);

  const handleSwitchChain = async (id: number) => {
    if (id === activeChainId) {
      return;
    }

    const chainName = getChainNameFromId(id);

    if (!address || isMagicActive) {
      setActiveChain(chainName);
    }

    onResetCountDown();
    resetPools();

    try {
      await switchChain({ chainId: id });
      setActiveChainId(id);

      setActiveChain(chainName);
    } catch (error) {
      console.error("Error switching chain:", error);
    }
  };

  const getItemName = (name: string) => {
    if (name === "BNB Smart Chain") {
      return "Binance Smart Chain";
    }

    return name;
  };

  return (
    <Menu>
      <MenuButton>
        <Flex alignItems="center" gap={isMobile ? "8px" : "12px"} color="lightGray">
          <Icon name={CHAIN_ICONS[activeChainId]} />
          <Text fontSize="medium">Select chain</Text>
          <Icon name={ICON_NAMES.chevronDown} />
        </Flex>
      </MenuButton>

      <MenuList
        zIndex={1000}
        as={Flex}
        direction="column"
        bg="black.60"
        border="none"
        p="24px 12px"
        gap="24px"
      >
        {chains.map(({ id, name }) => (
          <MenuItem
            key={name}
            bg="transparent"
            p="0"
            gap="8px"
            color={activeChainId === id ? "greenAlpha.60" : undefined}
            onClick={() => handleSwitchChain(id)}
          >
            <Icon name={CHAIN_ICONS[id]} />
            <Text>{getItemName(name)}</Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
});
