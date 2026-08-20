import { action, makeObservable, observable, runInAction } from "mobx";
import { getAreaChartAllIntervals, getChartData, getPools } from "../../api/pools/queries";
import { IPoolData } from "../pools/types";
import { ICHAIN } from "@/types";

class PoolStore {
  activePool: IPoolData | null = null;
  chartData: any = null;
  isLoading: boolean = false;
  isChartLoading: boolean = true;
  error: Error | null = null;

  constructor() {
    makeObservable(this, {
      activePool: observable,
      chartData: observable,
      isLoading: observable,
      isChartLoading: observable,
      error: observable,
      setActivePool: action.bound,
      resetActivePool: action,
      setError: action,
      setLoading: action,
      setChartLoading: action,
      fetchAndSetActivePool: action.bound,
      fetchChartData: action.bound
    });
  }

  setActivePool(pool: IPoolData) {
    this.activePool = pool;
  }

  resetActivePool() {
    this.activePool = null;
  }

  setError(error: Error | null) {
    this.error = error;
  }

  setLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  setChartLoading(isLoading: boolean) {
    this.isChartLoading = isLoading;
  }

  async fetchAndSetActivePool(type: "lending" | "borrowing", poolName: string, network: ICHAIN) {
    this.setLoading(true);
    this.setError(null);
    try {
      const pools: IPoolData[] = await getPools(type, network);
      runInAction(() => {
        const foundPool = pools.find(pool => pool.token === poolName);
        if (foundPool) {
          this.setActivePool(foundPool);
        } else {
          this.setError(new Error(`Pool with name ${poolName} not found`));
        }
      });
    } catch (error) {
      runInAction(() => {
        this.setError(error as Error);
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async fetchChartData(token: string, network: ICHAIN) {
    this.setChartLoading(true);
    this.setError(null);

    try {
      const chartData = await getAreaChartAllIntervals(token, network);
      runInAction(() => {

        this.chartData = chartData;
      });
    } catch (error) {
      runInAction(() => {
        this.setError(error as Error);
      });
    } finally {
      runInAction(() => {
        this.setChartLoading(false);
      });
    }
  }
}

export default PoolStore;
