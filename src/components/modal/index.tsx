import {
  Modal as DefaultModal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  ModalProps
} from "@chakra-ui/react";
import React, { FC } from "react";

interface IModalProps extends ModalProps {
  isCloseBtn?: boolean;
  maxWidth?: string;
}

export const Modal: FC<IModalProps> = ({
  isOpen,
  onClose,
  children,
  isCloseBtn = true,
  maxWidth,
  ...rest
}) => {
  return (
    <DefaultModal isOpen={isOpen} onClose={onClose} {...rest} isCentered>
      <ModalOverlay backdropFilter="auto" backdropBlur="5px" />
      <ModalContent bg="black.100" p="24px" borderRadius="2px" gap="24px" maxW={maxWidth}>
        {isCloseBtn && <ModalCloseButton color="ink3" zIndex={10} />}
        {children}
      </ModalContent>
    </DefaultModal>
  );
};
