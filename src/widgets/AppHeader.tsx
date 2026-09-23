"use client";

import { Flex, Link, useMediaQuery, Skeleton } from "@chakra-ui/react";
import React, { useState } from "react";
import NextLink from "next/link";
import { useAccount } from "wagmi";
import LogoDesc from "/public/assets/logo/logo-long.svg";
import LogoMob from "/public/assets/logo/logo-short.svg";
import { MEDIA_QUERY_MAX, MOCKED_ADDRESS, ROUTE_PATHS } from "../consts";
import { ConnectWallet } from "../features/ConnectWallet";
import { WalletProfile } from "../features/WalletProfile";
import { AppNav } from "./AppNav";
import MaintenanceBlock from "@/components/maintenance-block";
import { Wordmark } from "@/components/wordmark";

export const AppHeader = () => {
  const [media] = useMediaQuery(MEDIA_QUERY_MAX);
  const { isConnected, address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const isUnderMaintenance = process.env.NEXT_PUBLIC_IS_UNDER_MAINTENANCE === "true";
  const [isDesktop] = useMediaQuery("(min-width: 1130px)");

  return (
    <Flex
      flexDir="column"
      w="100%"
      alignItems="center"
      position="sticky"
      top={0}
      zIndex={100}
      bg="rgba(10, 11, 13, 0.9)"
      backdropFilter="blur(8px)"
      borderBottom="1px solid"
      borderColor="line"
      minH={isUnderMaintenance ? { base: "120px", md: "160px" } : { base: "56px", md: "64px" }}
    >
      {isUnderMaintenance && <MaintenanceBlock />}
      <Flex
        alignItems="center"
        p={{ base: "10px 16px", xl: "14px 0px" }}
        justifyContent="space-between"
        w="100%"
        maxW="1300px"
      >
        <Link as={NextLink} href={ROUTE_PATHS.lending} aria-label="Invictus home" minW={{ lg: "150px" }}>
          <Wordmark />
        </Link>

        {!media && <AppNav />}

        <Flex gap="12px" alignItems="center">
          {!!address && isDesktop && isLoading && <Skeleton height="24px" width="60px" />}
          {/* {isConnected && <AppNotification />} */}
          {!!address ? <WalletProfile className="step-1" /> : <ConnectWallet className="step-1" />}
          {media && <AppNav />}
        </Flex>
      </Flex>
    </Flex>
  );
};
