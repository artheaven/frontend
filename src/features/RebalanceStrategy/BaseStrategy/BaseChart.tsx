import { Flex, Text, useMediaQuery } from "@chakra-ui/react";
import React, { useState } from "react";
import { Area } from "recharts";

import { AreaChart } from "../../../components/charts/AreaChart";
import { DateSwitcher } from "../../../components/data-switcher";
import { useDateSwitcher } from "../../../components/data-switcher/hooks";
import { DATES } from "../../../components/data-switcher/utils";
import { colorsArea, tickFormatter } from "../utils";
import { LegendAreaChart } from "./components/LegendAreaChart";
import { IAreaLineProps } from "./types";
import { MEDIA_QUERY_MAX } from "../../../consts";
import { ILendChartData } from "@/api/pools/types";
import { ROUTES_TYPE } from "@/consts/routes-type";

const areaGradient = (
  <defs>
    <linearGradient id="color-lending" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={colorsArea.lending} stopOpacity={0.28} />
      <stop offset="95%" stopColor={colorsArea.lending} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="color-borrowing" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={"transparent"} stopOpacity={0.8} />
      <stop offset="95%" stopColor={"transparent"} stopOpacity={0} />
    </linearGradient>
  </defs>
);

const getAreaLines = (areas: IAreaLineProps[]) => {
  const arr = areas.map((area, i) => (
    <Area
      key={i}
      name={area.name}
      type="linear"
      dataKey={area.type}
      stroke={colorsArea[area.type]}
      activeDot={{ r: 3, stroke: colorsArea[area.type] }}
      fill={`url(#color-${area.type})`}
    />
  ));

  return [...arr, areaGradient];
};

const data = [
  {
    date: "12.01.2024",
    lending: 250,
    borrowing: 170
  },
  {
    date: "12.02.2024",
    lending: 410,
    borrowing: 218
  },
  {
    date: "12.05.2024",
    lending: 150,
    borrowing: 55
  },
  {
    date: "12.08.2024",
    lending: 20,
    borrowing: 178
  },
  {
    date: "12.09.2024",
    lending: 320,
    borrowing: 188
  },
  {
    date: "12.10.2024",
    lending: 290,
    borrowing: 230
  }
  // {
  //   date: "12.11.2024",
  //   lending: 3490,
  //   borrowing: 4300
  // }
];

interface IChartData {
  chartData: ILendChartData[];
  poolChart: any[];
}

export const BaseChart = ({ chartData }: { chartData: IChartData }) => {
  const [media] = useMediaQuery(MEDIA_QUERY_MAX);
  const { selectedDate, setSelectDate } = useDateSwitcher(DATES[0]);
  const [smDown] = useMediaQuery("(max-width: 420px)");

  const areaLines = [
    {
      name: "Invictus APY\n",
      subtext: `(${chartData.poolChart[selectedDate.name as any].rebalanceAvg.toFixed(
        2
      )}% average)`,
      type: ROUTES_TYPE.lending
    },
    {
      name: "Aave APY\n",
      subtext: `(${chartData.poolChart[selectedDate.name as any].aaveAvg.toFixed(2)}% average)`,
      type: ROUTES_TYPE.borrowing
    }
  ];

  return (
    <Flex w="100%" direction="column" position="relative">
      <Flex
        w="100%"
        alignItems="center"
        justify="space-between"
        mb={{ base: "40px", md: "10px" }}
        mt={{ base: "24px", md: "0px" }}
      >
        <Flex
          w="100%"
          justifyContent="space-between"
          alignItems="center"
          zIndex={{ base: 1, md: 0 }}
          position={{ base: "absolute", md: "relative" }}
          right={{ base: "0" }}
        >
          <Text textStyle="h2">Strategy profitability</Text>
          <DateSwitcher date={DATES} selectDate={setSelectDate} selectedDate={selectedDate} />
        </Flex>
      </Flex>

      <AreaChart
        data={chartData.poolChart[selectedDate.name as any].data}
        lines={getAreaLines(areaLines)}
        gradient={areaGradient}
        tickFormatter={tickFormatter}
        tooltipName
      />

      <Flex
        alignItems="center"
        gap="12px"
        mt="28px"
        flexDirection={media ? "column" : "row"}
        mr={media ? "auto" : "0"}
      >
        {areaLines.map(elem => (
          <LegendAreaChart
            key={elem.type}
            text={elem.name}
            subText={elem.subtext}
            color={colorsArea[elem.type]}
          />
        ))}
      </Flex>
    </Flex>
  );
};
