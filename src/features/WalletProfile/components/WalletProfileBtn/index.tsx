import { Button, Center, Divider, Flex, IconButton, Text } from "@chakra-ui/react";
import React, { FC } from "react";

import { JazzIcon } from "../../../../components/address-icon/JazzIcon";
import { ellipsis } from "../../../../utils";
import Icon from "@/components/icon";
import { ICON_NAMES } from "@/consts";
import { useAccount, useDisconnect } from "wagmi";
import { StatusPill } from "@/components/status-pill";
import { demoLedger } from "@/demo/ledger";

interface IWalletProfileBtnProps {
  address: string;
  onOpen: () => void;
  className: string;
}

export const WalletProfileBtn: FC<IWalletProfileBtnProps> = ({ onOpen, address, className }) => {
  const { disconnect } = useDisconnect();
  const { connector } = useAccount();
  return (
    <Flex as={Button} gap="6px" align="center" onClick={onOpen}>
      {/* <Flex gap="6px" align="center" className={className}> */}
      <JazzIcon address={address} />
      <Text fontFamily="mono" fontSize="sm" mr={{ base: 2, md: connector?.id === "demo" ? 2 : 4 }}>
        {ellipsis(String(address))}
      </Text>
      {connector?.id === "demo" ? <StatusPill kind="DEMO" mr={2} display={{ base: "none", md: "inline-flex" }} /> : null}
      <Center height="20px">
        <Divider orientation="vertical" />
      </Center>
      <IconButton
        ml={0}
        aria-label="logout"
        onClick={() => {
          if (connector?.id === "demo") demoLedger.reset();
          disconnect();
        }}
        icon={<Icon size="m" name={ICON_NAMES.logoutSquare} />}
      />
    </Flex>
  );
};
