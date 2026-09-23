import {
  Circle,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Text,
  useDisclosure
} from "@chakra-ui/react";
import React from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import Image from "next/image";
import { JazzIcon } from "../../components/address-icon/JazzIcon";
import Icon from "../../components/icon";
import { ICON_NAMES } from "../../consts";
import { ellipsis } from "../../utils";
import { WalletProfileBtn } from "./components/WalletProfileBtn";
import { WalletProfileSettings } from "./components/WalletProfileSettings";
import { WalletProfileTransactionHistory } from "./components/WalletProfileTransactionHistory";
import { useMagic } from "@/contexts/useMagic";

interface IWalletProfileProps {
  className: string;
}

export const WalletProfile = ({ className }: IWalletProfileProps) => {
  const { disconnect } = useDisconnect();
  const { address, connector, isConnected, chain } = useAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { magic } = useMagic();

  const isActiveMagic = connector?.id === "magic";

  const onOpenMagicWallet = () => {
    magic?.wallet.showUI();
  };

  // const onOpenWallet = isActiveMagic ? onOpenMagicWallet : onOpen;
  const onOpenWallet = isActiveMagic ? onOpenMagicWallet : () => {};

  const name = connector?.name;

  return (
    <>
      <WalletProfileBtn onOpen={onOpenWallet} address={String(address)} className={className} />

      <Drawer isOpen={isOpen} onClose={onClose} placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader as={Flex} align="center" justify="start">
            <Flex align="inherit" gap="4px">
              <Icon
                style={{ cursor: "pointer" }}
                aria-label="back"
                name={ICON_NAMES.close}
                size="36px"
                onClick={onClose}
              />
              <Text>My Profile</Text>
            </Flex>
          </DrawerHeader>

          <DrawerBody as={Flex} gap="24px" direction="column">
            <Flex w="100%" justify="space-between" align="center" h="fit-content">
              <Flex gap="10px" align="center">
                <JazzIcon address={String(address)} size={42} />
                <Flex direction="column" gap="10px">
                  <Text fontWeight="500">{ellipsis(String(address))}</Text>
                  <Flex align="center" gap="6px">
                    <Circle bg={isConnected ? "pos" : "neg"} size="6px" />
                    <Text fontSize="xs">Connected to {name}</Text>
                  </Flex>
                </Flex>
              </Flex>
              <IconButton
                aria-label="logout"
                onClick={() => disconnect()}
                icon={<Icon name={ICON_NAMES.logoutSquare} />}
              />
            </Flex>

            <WalletProfileSettings />

            {/* <WalletProfileNotification /> */}

            <WalletProfileTransactionHistory />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
