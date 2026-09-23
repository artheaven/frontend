import { Flex, Switch, Text } from "@chakra-ui/react";
import React from "react";

import { BarChart } from "../../../components/charts/BarChart";
import { barGradient } from "../../../components/charts/utils";
import { DateSwitcher } from "../../../components/data-switcher";
import { useDateSwitcher } from "../../../components/data-switcher/hooks";
import { DATES } from "../../../components/data-switcher/utils";
import { LTV } from "../../../components/ltv";
import { themes } from "../../../themes";
import { tickFormatter } from "./utils";
import { tokens } from "@/themes/styles/colors";

const colors = {
  borrowingFee: {
    top: tokens.neg,
    bottom: tokens.neg
  },
  healthFactor: tokens.accent
};

const dataBarReverse = [
  {
    date: "12.01.2024",
    lending: 4000
  },
  {
    date: "12.02.2024",
    lending: 3000
  },
  {
    date: "12.05.2024",
    lending: 2000
  },
  {
    date: "12.08.2024",
    lending: 2780
  },
  {
    date: "12.09.2024",
    lending: 1890
  },
  {
    date: "12.10.2024",
    lending: 2390
  },
  {
    date: "12.11.2024",
    lending: 3490
  }
];

export const BorrowChart = () => {
  const { selectedDate, setSelectDate } = useDateSwitcher(DATES[0]);
  const mockLtv = 78;

  return (
    <Flex direction={{ base: "column", md: "row" }} w="100%" gap={{ base: "24px" }}>
      <Flex direction="column" w="100%" h={{ base: "317px", md: "auto" }}>
        <Flex alignItems={{ base: "center" }} justifyContent={{ base: "space-between" }} mb="10px">
          <Text color="lightGray">Borrowing fees</Text>
          <DateSwitcher date={DATES} selectDate={setSelectDate} selectedDate={selectedDate} />
        </Flex>
        <BarChart
          data={dataBarReverse}
          bar={barGradient({ data: dataBarReverse, color: colors.borrowingFee })}
          reversed
          tickFormatter={tickFormatter}
        />
      </Flex>

      <Flex w="100%" direction="column" h={{ base: "317px", md: "auto" }}>
        <Flex alignItems={{ base: "center" }} justifyContent={{ base: "space-between" }} mb="10px">
          <Text color="lightGray">Health Factor</Text>
          <Flex
            alignItems="center"
            justifyContent="center"
            borderRadius="4px"
            p="4px 6px 4px 6px"
            bg="orangeAlpha.10"
            fontSize="lg"
            color="orangeAlpha.100"
          >
            {mockLtv}%
          </Flex>
        </Flex>

        <LTV ltv={mockLtv} />

        <Flex alignItems={{ base: "center" }} justifyContent={{ base: "space-between" }} mt="10px">
          <Text color="lightGray">Extra-Collateral</Text>
          <Switch />
        </Flex>
      </Flex>
    </Flex>
  );
};
