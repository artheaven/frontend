import { Button, useMediaQuery } from "@chakra-ui/react";
import React from "react";
import { isMobile } from "react-device-detect";

import { MEDIA_QUERY_MAX } from "../../consts";
import { useStore } from "@/hooks/useStoreContext";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export const ConnectWallet = ({
  title,
  variant,
  minHeight,
  className,
  id,
  onClick
}: {
  title?: string;
  variant?: string;
  minHeight?: string;
  className?: string;
  id?: string;
  onClick?: VoidFunction;
}) => {
  const { openModal } = useStore("modalStore");
  const [media] = useMediaQuery(MEDIA_QUERY_MAX);
  const { openConnectModal } = useConnectModal();

  const onOpenConnectWalletModal = () => {
    if (onClick) {
      onClick();
    }
    // openModal({
    //   // @ts-ignore
    //   type: ModalEnum.ConnectWallet
    // });
    if (openConnectModal) {
      openConnectModal();
    }
  };

  if (media) {
    return (
      <Button
        id={id}
        p={variant ? "16px 24px" : title ? 0 : "0 14px"}
        h={!variant && !title ? "34px" : undefined}
        onClick={onOpenConnectWalletModal}
        variant={variant ? variant : title === "Deposit" ? "primaryFilled" : "primaryWhite"}
        flex="1 1 0"
        width={variant ? "100%" : "auto"}
        className={className}
      >
        {title ? title : "Connect wallet"}
      </Button>
    );
  }

  return (
    <Button
      id={id}
      onClick={onOpenConnectWalletModal}
      variant={variant ? variant : title === "Deposit" ? "primaryFilled" : "primaryWhite"}
      flex="1 1 0"
      width={variant ? "100%" : "auto"}
      mt={variant ? 4 : 0}
      h={variant ? "52px" : title ? "auto" : "36px"}
      px={!variant && !title ? "16px" : undefined}
      minH={minHeight}
      className={className}
    >
      {title ? title : "Connect wallet"}
    </Button>
  );
};
