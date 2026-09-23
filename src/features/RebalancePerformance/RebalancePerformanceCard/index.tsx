"use client";
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import React, { FC } from "react";
import { Skeleton } from "@chakra-ui/react";
import Img from "./Images";
import protokol from "/public/assets/image/Protocols.svg";
import logoSrc from "/public/assets/logo/logo-short.svg";
import { formatNumber } from "@/utils/formatNumber";
import Link from "next/link";
import { FIRELABS_AUDIT_LINK, HACKEN_AUDIT_LINK } from "@/consts";
interface RebalncePerformanceCardProps {
  image: string;
  title: string;
  subtitle: string;
  info: string;
  isActive: boolean;
  logo: string;
  type: string;
  logos: { src: string; w: number; h: number }[];
}

export const RebalancePerformanceCard: FC<RebalncePerformanceCardProps> = ({
  image,
  info,
  isActive,
  logo,
  type,
  logos
}) => {
  return (
    <Flex
      bg={isActive ? "black.80" : undefined}
      w="631px"
      borderRadius="2px"
      position="relative"
      _before={
        isActive
          ? {
              content: `""`,
              borderLeftRadius: "4px",
              w: "4px",
              h: "100%",
              position: "absolute",
              bg: "greenAlpha.100",
              zIndex: 5
            }
          : {}
      }
    >
      {type !== "lending" ? (
        <Flex
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          margin="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          background="000"
          backdropFilter="blur(4px)"
          zIndex="9"
          fontSize="large"
          fontWeight="500"
        >
          Coming Soon
        </Flex>
      ) : null}
      <Box borderLeftRadius="4px">
        <Image boxSize="200px" objectFit="fill" src={image} />
      </Box>
      <Flex direction="column" p="16px" gap="8px" flex="1">
        <Flex justify="space-between" alignItems="center">
          <Image src={logo} w="116px" h="29px" />
          {/* <Flex gap={2} alignItems="center">
            <Text
              fontWeight="300"
              color="ink"
              fontSize="16px"
              textStyle="textMono16"
              display="flex"
              alignItems="flex-end"
            >
              TVL: ${info !== "0" && info}
            </Text>
            {info === "0" && <Skeleton ml={2} height="20px" width="60px" />}
          </Flex> */}
        </Flex>
        <Box
          mt="12px"
          textAlign="start"
          display="flex"
          flexDir="column"
          fontSize="13px"
          color="ink"
        >
          {type === "lending" ? (
            <>
              <Text>Computations by Chainlink Automation ® </Text>
              <Text>
                Audited by{" "}
                <Link
                  href={HACKEN_AUDIT_LINK}
                  target="_blank"
                  style={{ textDecoration: "underline" }}
                >
                  Hacken
                </Link>
                ,{" "}
                <Link
                  href={FIRELABS_AUDIT_LINK}
                  target="_blank"
                  style={{ textDecoration: "underline" }}
                >
                  4ire Labs
                </Link>
              </Text>
              <Text>Protected by Hacken Extractor ® </Text>
            </>
          ) : (
            <>
              <Text>DAO governed</Text>
              <Text>Higher yield</Text>
              <Text>+10% RBLN extra APY</Text>
              <Text>Turtle Club® Incentives</Text>
            </>
          )}
        </Box>
        <Flex alignItems="center" mt="auto">
          <Box display="flex" alignItems="center">
            <Text color="ink" fontSize="12px">
              {type === "lending" ? "Extra-incentives" : "Extra-points"}
            </Text>
            <Image
              ml="8px"
              src={type === "lending" ? "/assets/logo/logo-short.svg" : protokol.src}
              w={type === "lending" ? "max-content" : "24px"}
              h={type === "lending" ? "16px" : "24px"}
            />
          </Box>
          {/* {type === "lending" && (
            <Image ml="8px" src="/assets/icons/arbitrum-icon.svg" w="16px" h="16px" />
          )} */}
          <Box ml="auto" display="flex" gap="12px" alignItems="center">
            {logos.map((logo, index) => (
              <Img key={index} src={logo.src} width={logo.w} height={logo.h} />
            ))}
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};
