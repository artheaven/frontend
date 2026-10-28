import { Flex, Text } from "@chakra-ui/react";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { themes } from "../../../themes";
import { colorsArea, tickFormatter } from "../utils";

/**
 * Share price of the vault token in the deposit asset. Derived from the APY series: the price
 * compounds each interval at that interval's APY, anchored so the last point equals the price
 * implied by the vault's age (it starts at 1.0000 on launch).
 */

interface Point {
  date: string;
  lending: number;
}

export const sharePriceNow = (netApyPct: number, launchedAt: string, now = Date.now()) => {
  const days = Math.max(0, (now - Date.parse(launchedAt)) / 86_400_000);
  return Math.pow(1 + netApyPct / 100, days / 365);
};

export function sharePriceSeries(points: Point[], priceNow: number, launchedAt: string) {
  const launch = Date.parse(launchedAt);
  const out: { date: string; price: number }[] = [];
  let price = priceNow;
  // Points are oldest first and dated at the start of their interval; walk back from now.
  let end = Date.now();
  for (let i = points.length - 1; i >= 0; i--) {
    const start = Date.parse(points[i]!.date);
    if (start < launch) break;
    price /= Math.pow(1 + (points[i]!.lending || 0) / 100, (end - start) / (365 * 86_400_000));
    out.push({ date: points[i]!.date, price });
    end = start;
  }
  return out.reverse().concat({ date: new Date().toISOString(), price: priceNow });
}

const PriceTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <Flex direction="column" gap="4px" p="10px" bg="bg3" border="1px solid" borderColor="line" borderRadius="10px">
      <Text fontFamily="mono" fontSize="xs" color="ink3">
        {dayjs(p.date).format("MMM DD, YYYY")}
      </Text>
      <Text fontFamily="mono" fontSize="sm" color="ink">
        {p.price.toFixed(4)}
      </Text>
    </Flex>
  );
};

export const SharePriceChart = ({
  points,
  netApy,
  launchedAt,
  token,
  shareToken
}: {
  points: Point[];
  netApy: number;
  launchedAt: string;
  token: string;
  shareToken: string;
}) => {
  const priceNow = sharePriceNow(netApy, launchedAt);
  const series = useMemo(() => sharePriceSeries(points, priceNow, launchedAt), [points, priceNow, launchedAt]);
  const first = series[0]?.price ?? priceNow;
  const change = (priceNow / first - 1) * 100;
  const min = Math.min(...series.map(s => s.price));
  const max = Math.max(...series.map(s => s.price));
  const pad = Math.max((max - min) * 0.15, 0.0005);

  return (
    <Flex direction="column" w="100%" h="100%" minH={0}>
      <Flex align="baseline" gap="12px" mb="12px" wrap="wrap">
        <Text fontFamily="mono" fontSize="22px" color="ink">
          {priceNow.toFixed(4)} {token}
        </Text>
        <Text fontFamily="mono" fontSize="xs" color={change >= 0 ? "pos" : "neg"}>
          {change >= 0 ? "+" : ""}
          {change.toFixed(2)}% over the period
        </Text>
        <Text fontFamily="mono" fontSize="xs" color="ink3">
          per 1 {shareToken} · 1.0000 at launch, {launchedAt}
        </Text>
      </Flex>
      <Flex flex="1" minH={0}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="color-share-price" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorsArea.lending} stopOpacity={0.28} />
                <stop offset="95%" stopColor={colorsArea.lending} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <Tooltip cursor={{ opacity: 0.1, strokeWidth: 1 }} content={<PriceTooltip />} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickSize={10}
              interval="preserveStartEnd"
              tickFormatter={tickFormatter}
              axisLine={false}
              stroke={themes.colors.darkGray}
              fontSize={themes.fontSizes.sm}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={56}
              domain={[min - pad, max + pad]}
              tickFormatter={(v: number) => v.toFixed(3)}
              fontSize={themes.fontSizes.sm}
              stroke={themes.colors.darkGray}
            />
            <Area type="linear" dataKey="price" name="Share price" stroke={colorsArea.lending} fill="url(#color-share-price)" activeDot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Flex>
    </Flex>
  );
};
