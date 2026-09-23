import { Divider, Flex, Text } from "@chakra-ui/react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { useDateSwitcher } from "../../../components/data-switcher/hooks";
import { DATESEarned } from "../../../components/data-switcher/utils";
import { useEffect, useState } from "react";
import { getPersonalEarnings } from "@/api/pools/queries";
import { CustomTooltipBarChart } from "./components/CustomToolTipBarChart";
import { IPoolData } from "@/api/pools/types";
import { DepositLendingButton } from "@/features/actions/deposit-or-withdraw-button/DepositLendingButton";
import { themes } from "../../../themes";
import { tickFormatter } from "../utils";
import { DateSwitcher } from "@/components/data-switcher";
import { useAccount } from "wagmi";
import { observer } from "mobx-react-lite";
import { useStore } from "@/hooks/useStoreContext";
import { tokens } from "@/themes/styles/colors";

const data = [
  {
    name: "Page 1",
    uv: 1000
  },
  {
    name: "Page 2",
    uv: 2000
  },
  {
    name: "Page 3",
    uv: 2000
  },
  {
    name: "Page 4",
    uv: 1780
  },
  {
    name: "Page 5",
    uv: 1890
  },
  {
    name: "Page 6",
    uv: 1390
  },
  {
    name: "Page 7",
    uv: 1490
  },
  {
    name: "Page 8",
    uv: 1200
  },
  {
    name: "Page 9",
    uv: 1130
  },
  {
    name: "Page 10",
    uv: 1200
  },
  {
    name: "Page 11",
    uv: 1780
  },
  {
    name: "Page 12",
    uv: 1890
  },
  {
    name: "Page 14",
    uv: 1390
  },
  {
    name: "Page 15",
    uv: 390
  },
  {
    name: "Page 16",
    uv: 2000
  },
  {
    name: "Page 17",
    uv: 2000
  },
  {
    name: "Page 18",
    uv: 1200
  },
  {
    name: "Page 19",
    uv: 1780
  },
  {
    name: "Page 20",
    uv: 1790
  },
  {
    name: "Page 21",
    uv: 1790
  },
  {
    name: "Page 22",
    uv: 2490
  },
  {
    name: "Page 23",
    uv: 2000
  },
  {
    name: "Page 24",
    uv: 2000
  },
  {
    name: "Page 25",
    uv: 1000
  },
  {
    name: "Page 26",
    uv: 1780
  },
  {
    name: "Page 27",
    uv: 890
  },
  {
    name: "Page 28",
    uv: 1270
  },
  {
    name: "Page 29",
    uv: 1490
  }
];

interface IBarChartData {
  name: Date | string;
  uv: number;
  apr: number | null;
}

const EarningsChart = observer(
  ({
    address,
    token,
    pool
  }: {
    address: `0x${string}` | undefined;
    token: string;
    pool: IPoolData;
  }) => {
    const { selectedDate, setSelectDate } = useDateSwitcher(DATESEarned[0]);
    const [userEarningsData, setUserEarningsData] = useState<IBarChartData[] | undefined>(
      undefined
    );
    const [avgApr, setAvgApr] = useState<number>(0);
    const [error, setError] = useState(false);
    const { activeChain } = useStore("poolsStore");

    useEffect(() => {
      if (address) {
        setError(false);
        getPersonalEarnings(
          selectedDate.interval,
          selectedDate.intervals,
          address,
          token,
          activeChain
        )
          .then(data => {
            setUserEarningsData(data.userEarned);
            setAvgApr(data.avgAPR);
          })
          .catch(e => {
            setError(true);
          });
      }
      // TODO: bring back when api is ready with date
      // }, [address, selectedDate]);
    }, [address]);

    const userTotalEarning = userEarningsData?.reduce((acc, el) => acc + el.uv, 0) || 0;

    return (
      <>
        {!error ? (
          <Flex flexDirection="column" width="100%">
            <Flex mt="48px" mb="12px" justifyContent="space-between" alignItems="center">
              <Text textStyle="h2">My earnings</Text>
              <DateSwitcher
                date={DATESEarned}
                selectDate={setSelectDate}
                selectedDate={selectedDate}
              />
            </Flex>
            <Flex w="100%" bg="bg2" borderWidth="1px" borderStyle="solid" borderColor="line" borderRadius="2px" minH="319px" padding="24px">
              <Flex flexDirection="column" width="27%" justifyContent="center">
                <Flex flexDirection="column">
                  <Text textStyle="eyebrow">Earned in 30D</Text>
                  <Text textStyle="textMono16">{`$ ${userTotalEarning.toFixed(2)}`}</Text>
                </Flex>
                <Divider mt="22px" mb="22px" borderColor="line" height="2px" width="82px" />
                <Flex flexDirection="column">
                  <Text textStyle="eyebrow">Av. 30D APY</Text>
                  <Text textStyle="textMono16">{`${avgApr.toFixed(2)} %`}</Text>
                </Flex>
              </Flex>
              <Flex position={"relative"} w={"100%"}>
                <ResponsiveContainer width="100%" height="100%">
                  {address ? (
                    <BarChart width={150} height={10} data={userEarningsData}>
                      <Bar barSize={6} dataKey="uv" fill={tokens.accent} minPointSize={5}>
                        {userEarningsData?.map((entry, index) => {
                          const color = entry.uv > 0 ? tokens.accent : tokens.accentTint;
                          return <Cell key={entry.name.toString()} fill={color} />;
                        })}
                      </Bar>
                      <Tooltip
                        cursor={{ opacity: 0.1, strokeWidth: 1 }}
                        content={<CustomTooltipBarChart />}
                      />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickSize={10}
                        interval="preserveStartEnd"
                        tickFormatter={tickFormatter}
                        axisLine={false}
                        stroke={themes.colors.darkGray}
                        fontSize={themes.fontSizes.sm}
                      />
                    </BarChart>
                  ) : (
                    <BarChart width={150} height={10} data={data}>
                      <Bar barSize={6} dataKey="uv" fill={tokens.accent} minPointSize={5}></Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
                {!address ? (
                  <Flex
                    position="absolute"
                    inset="0"
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
                    <Flex w={"50%"}>
                      <DepositLendingButton variant="primaryWhite" pool={pool} minHeight="40px" />
                    </Flex>
                  </Flex>
                ) : null}
              </Flex>
            </Flex>
          </Flex>
        ) : (
          <Flex flexDirection="column" width="100%">
            <Flex mt="48px" mb="12px" justifyContent="space-between" alignItems="center">
              <Text textStyle="h2">My monthly earnings</Text>
            </Flex>
            <Flex align={"center"} justify={"center"} width="100%" mt="48px">
              <Text color="white">Error on loading data. Please try again later</Text>
            </Flex>
          </Flex>
        )}
      </>
    );
  }
);

export default EarningsChart;
