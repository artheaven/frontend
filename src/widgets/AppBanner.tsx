import { Button, Flex, Image, Text } from "@chakra-ui/react";
import React from "react";

import BannerImage from "/public/assets/image/Banner.svg";
import { useStore } from "../hooks/useStoreContext";
import { ModalContextEnum } from "../store/modal/types";

export const AppBanner = () => {
  const { openModal } = useStore("modalContextStore");

  return (
    <Flex
      h={{ base: "100%", md: "240px" }}
      w="100%"
      bg="black.70"
      justify="center"
      p={{ base: "16px", md: "0" }}
      order={{ base: 1, md: 0 }}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        gap="44px"
        maxW={"1300px"}
        w="100%"
        px={{ base: "16px", xl: "0" }}
      >
        <Image src={BannerImage} />
        <Flex
          direction="column"
          gap="24px"
          justify="center"
          alignItems={{ base: "center", md: "start" }}
        >
          <Flex
            direction="column"
            gap={{ base: "8px", md: "16px" }}
            textAlign={{ base: "center", md: "start" }}
          >
            <Text textStyle="h1">Early-depositor’s programme</Text>
            <Text textStyle="h2">Join now and get Invictus Club NFT, with unique utilities</Text>
            <Text fontWeight="500" color="lightGray">
              NFTs minted: 126 / 256
            </Text>
          </Flex>
          <Button
            variant="primaryWhite"
            w={{ base: "100%", md: "auto" }}
            onClick={() => openModal({ type: ModalContextEnum.Reject })}
          >
            Join & Mint NFT
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
