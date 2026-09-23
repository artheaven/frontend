export interface IPoolData {
  token: string;
  tokenAddress: string;
  rebalancerAddress: string;
  tokenPriceInUsd: number;
  tokenPrice24HrChangeInPercentages: number;
  tokenPrice24HrChangeInUsd: number;
  apr: number;
  funds: number;
  avgApr: number;
  earned: number;
  decimals: number;
  deposit: number;
  risk: number;
  borrowRate: number;
  borrowed: number;
  /** Current split across destinations, if the backend provides it. `share` is a fraction. */
  allocations?: IPoolAllocation[];
  /** Observation time of the metrics (ISO, UTC), if provided. */
  asOf?: string;
}

export interface IPoolAllocation {
  protocol: string;
  destination: string;
  share: number;
}
export interface IPoolsData {
  token: string;
  vaultAddress: string;
  tokenAddress: string;
  tokenDecimals: number;
  tokenPrice: number;
  funds: number;
  earned: number;
  avgApr30D: number;
  highestMarket30DAvgAprDiffPercentage: number;
  allocations?: IPoolAllocation[];
  asOf?: string;
}

export interface ILendChartData {
  date: Date,
  lending: number | null
}

export interface IIntervalResponse {
  from: Date,
  to: Date,
  value: number | null
}

export interface IAreaChartData {
  poolChart: {
    [key: string]: {
      data: ILendChartData[],
      rebalanceAvg: number,
      aaveAvg: number,
    },
    '1m': {
      data: ILendChartData[],
      rebalanceAvg: number,
      aaveAvg: number,
    },
    '6m': {
      data: ILendChartData[],
      rebalanceAvg: number,
      aaveAvg: number,
    },
    '1y': {
      data: ILendChartData[],
      rebalanceAvg: number,
      aaveAvg: number,
    },
  },
  chartData: {
    [key: string]: ILendChartData[],
    '1m': ILendChartData[],
    '6m': ILendChartData[],
    '1y': ILendChartData[],
  }
}

export interface ITotalProfit {
  totalProfit: number
}
export type RebalanceReason = "rate" | "new_liquidity" | "utilization" | "risk_gate" | "manual";

export interface IRebalanceEvent {
  id: number;
  /** ISO timestamp, UTC */
  ts: string;
  from: string;
  to: string;
  /** Amount moved, in asset units */
  amount: number;
  reason: RebalanceReason;
  txHash?: `0x${string}`;
}

export interface IRebalancePage {
  items: IRebalanceEvent[];
  total: number;
}
