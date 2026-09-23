import { Flex } from "@chakra-ui/layout";
import React, { FC } from "react";

import { Bar } from "./Bar";

const quantityLtv = 30;
const maxLtvPercent = 100;

const defaultLtv = Array.from({ length: quantityLtv }, (_, i) =>
  Math.round(((i + 1) * maxLtvPercent) / quantityLtv)
);

export const LTV: FC<{ ltv: number }> = ({ ltv }) => {
  return (
    <Flex h="100%" gap="3px" justify="space-between">
      {defaultLtv.map((item, i) => {
        if (item > ltv) return <Bar key={item} bg="black.40" />;
        if (defaultLtv[i - 1] < ltv && defaultLtv[i + 1] > ltv)
          return <Bar key={item} bg="orangeAlpha.80" />;
        if (ltv === item) return <Bar key={item} bg="redAlpha.80" />;

        return <Bar key={item} bg="posAlpha.80" />;
      })}
    </Flex>
  );
};
