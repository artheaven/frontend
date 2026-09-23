import { Box, Flex } from "@chakra-ui/react";
import React, { FC } from "react";

import { IRiskProps } from "./types";
import { riskColor } from "./utils";

export const Risk: FC<IRiskProps> = ({ risk, w = "4px", h = "24px", gap = "4px" }) => {
  const defaultRiskItems = Array.from({ length: 5 }, (_, i) => (
    <Box key={i} w={w} h={h} bg="lineStrong" borderRadius="1px"></Box>
  )).slice(risk);
  const activeRiskItems = Array.from({ length: risk }, (_, i) => (
    <Box key={i} w={w} h={h} borderRadius="2px" bg={riskColor[risk]}></Box>
  ));

  const finaly = [...activeRiskItems, ...defaultRiskItems];

  return (
    <Flex gap={gap} align="center">
      {finaly}
    </Flex>
  );
};
