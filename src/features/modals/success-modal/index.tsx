import {
  Button,
  Flex,
  IconButton,
  Link,
  ModalBody,
  ModalContent,
  Text,
  VStack
} from "@chakra-ui/react";
import React, { FC, useEffect, useState } from "react";

import Icon from "../../../components/icon";
import { Modal } from "../../../components/modal";
import { ICON_NAMES } from "../../../consts";
import { ISuccessModalContextProps } from "../types";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { getExplorerTxLink } from "@/utils";
import { DEMO_MODE } from "@/demo/config";
import { StatusPill } from "@/components/status-pill";
import { StatusMark } from "@/components/status-mark";

export const SuccessModal: FC<ISuccessModalContextProps> = ({
  chainName,
  isOpen,
  onClose,
  txHash,
  id,
  onClick
}) => {
  const copy = useCopyToClipboard();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (onClick) {
      onClick();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCountdown(10);

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(timer);
            onClose();
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, onClose]);

  const handleCopyAddress = () => {
    if (txHash) {
      copy(txHash);
    }
  };

  const handleOpenExplorer = () => {
    if (txHash) {
      window.open(getExplorerTxLink(txHash, chainName), "_blank");
    }
  };

  const getExplorerTitle = () => {
    switch (chainName) {
      case "BSC":
        return "BscScan";
      case "Base":
        return "BaseScan";
      case "Ethereum":
        return "Etherscan";
      default:
        return "Arbiscan";
    }
  };

  return (
    <Modal id={id} isOpen={isOpen} onClose={onClose} isCloseBtn={false}>
      <ModalContent bg="bg2" width="100%" maxWidth="648px">
        <ModalBody maxW="648px" width="100%" p="24px">
          <VStack gap="24px">
            <StatusMark kind="success" />

            <Text textStyle="h2">Transaction confirmed</Text>
            {DEMO_MODE ? <StatusPill kind="DEMO" title="Simulated transaction — nothing was sent on-chain" /> : null}
            <Flex flexDir="column" gap="8px" alignItems="center" w="100%">
              <Text color="ink2">{DEMO_MODE ? "Simulated transaction hash:" : "Your transaction is completed successfully:"}</Text>

              <Flex
                align="center"
                justify="center"
                w="100%"
                bg="bg"
                p="12px"
                gap="8px"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="line"
                borderRadius="2px"
              >
                <Text
                  fontFamily="mono"
                  fontSize="sm"
                  color="ink2"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {txHash}
                </Text>
                <IconButton
                  aria-label="copy"
                  icon={<Icon name={ICON_NAMES.checkboxMultipleBlank} size="sm" />}
                  onClick={handleCopyAddress}
                />
              </Flex>
            </Flex>
            <Flex flexDir="column" gap="12px" w="100%">
              {DEMO_MODE ? null : (
                <Button variant="primaryWhite" w="100%" minH="44px" onClick={handleOpenExplorer}>
                  View on {getExplorerTitle()}
                </Button>
              )}
              <Button
                variant="primaryFilled"
                w="100%"
                minH="44px"
                onClick={onClose}
              >
                Close
                <Text as="span" color="ink3" ml="4px">
                  ({countdown}s)
                </Text>
              </Button>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
