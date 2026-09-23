import { Button, Flex, ModalBody, ModalContent, Text, VStack } from "@chakra-ui/react";
import React, { FC, useEffect, useState } from "react";

import Icon from "../../../components/icon";
import { Modal } from "../../../components/modal";
import { ICON_NAMES } from "../../../consts";
import { IErrorModalContextProps } from "../types";
import { StatusMark } from "@/components/status-mark";

export const RejectModal: FC<IErrorModalContextProps> = ({
  isOpen,
  onClose,
  title,
  content,
  onRetry
}) => {
  const [countdown, setCountdown] = useState(10);

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCloseBtn={false} maxWidth="648px">
      <ModalContent bg="black.60" width="100%" maxWidth="648px">
        <ModalBody w="100%" p="24px">
          <VStack gap="24px">
            <StatusMark kind="error" />

            <Text fontSize="22px" fontWeight="600">
              {title}
            </Text>
            <Text textAlign="center">{content}</Text>

            <Flex w="100%" align="center" gap="16px">
              <Button variant="primaryFilled" w="100%" onClick={onRetry}>
                Try again
              </Button>
              <Button
                variant="outline"
                w="100%"
                minH="44px"
                _hover={{ opacity: 0.8 }}
                onClick={onClose}
              >
                Close
                <span style={{ color: "darkgray", marginLeft: "4px" }}>({countdown}sec)</span>
              </Button>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
