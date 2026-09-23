import { Flex, Link, useMediaQuery } from "@chakra-ui/react";
import { Wordmark } from "@/components/wordmark";
import React from "react";

import LogoDesc from "/public/assets/logo/logo-long.svg";
import LogoMob from "/public/assets/logo/logo-short.svg";
import Icon from "../components/icon";
import { MEDIA_QUERY_MAX } from "../consts";
import { FooterLink, FooterMedia } from "./utils";
import NextLink from "next/link";

export const AppFooter = () => {
  const [media] = useMediaQuery(MEDIA_QUERY_MAX);
  return (
    <Flex w="100%" justify="center" borderTop="1px solid" borderColor="line" mt={!media ? "64px" : "32px"}>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        maxW={"1300px"}
        w="100%"
        alignItems="center"
        p={{ base: "24px 16px", md: "32px 16px", xxl: "32px 0" }}
        gap={{ base: "24px", md: "0" }}
      >
        <Wordmark fontSize="xs" />

      <Flex gap={{ base: "24px", md: "40px" }} order={{ base: 0, md: 1 }}>
        {FooterLink.map(link => (
          <Link variant="link" as={NextLink} key={link.name} href={link.path}>
            {link.name}
          </Link>
        ))}
      </Flex>

      <Flex gap={{ base: "24px" }} order={{ base: 1, md: 2 }}>
        {FooterMedia.map(media => (
          <Link key={media.name} as={NextLink} href={media.path} target="_blank">
            <Icon name={media.name} />
          </Link>
        ))}
      </Flex>
      </Flex>
    </Flex>
  );
};
