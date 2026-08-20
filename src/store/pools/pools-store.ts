import { action, makeObservable, observable, runInAction } from "mobx";
import { getPools } from "../../api/pools/queries";
import { IPoolData } from "./types";
import { ICHAIN } from "@/types";

class PoolsStore {
  pools: IPoolData[] = [];
  isLoading = false;
  isFetched = false;
  error: Error | null = null;
  interval: ReturnType<typeof setInterval> | null = null;
  activeChain: ICHAIN = "Ethereum";

  constructor() {
    makeObservable(this, {
      pools: observable,
      isLoading: observable,
      isFetched: observable,
      error: observable,
      activeChain: observable,
      fetchPools: action,
      startPolling: action,
      stopPolling: action,
      setError: action,
      setIsFetched: action,
      setActiveChain: action,
      resetPools: action
    });
  }

  setError = (error: Error | null) => {
    this.error = error;
  };

  setIsFetched = (isFetched: boolean) => {
    runInAction(() => {
      this.isFetched = isFetched;
    });
  };

  setActiveChain = (chain: ICHAIN) => {
    runInAction(() => {
      this.activeChain = chain;
    });
  };

  fetchPools = async (type: "lending" | "borrowing", network: ICHAIN): Promise<void> => {
    if (this.isLoading) return;

    this.isLoading = true;
    this.setError(null);

    try {
      const data: IPoolData[] = await getPools(type, network);
      const sortedData = data.sort((a, b) => {
        if (a.token === "FRAX") return -1;
        if (b.token === "FRAX") return 1;

        if (a.token === "wETH") return 1;
        if (b.token === "wETH") return -1;
        return 0;
      });
      runInAction(() => {
        this.pools = sortedData;
        this.isFetched = true;
      });
    } catch (error) {
      runInAction(() => {
        this.setError(error as Error);
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  startPolling = (type: "lending" | "borrowing" = "lending", network: ICHAIN) => {
    // this.fetchPools(type, network);
    // this.interval = setInterval(() => this.fetchPools(type, network), 60000);
    this.fetchPools(type, network);

    // Clear any previous interval to avoid duplication
    if (this.interval) {
      clearInterval(this.interval);
    }

    // Set up polling every 60 seconds
    this.interval = setInterval(() => this.fetchPools(type, network), 60000);
  };

  stopPolling = () => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  };

  resetPools = () => {
    this.pools = [];
    this.isFetched = false;
    this.error = null;
  };
}

export default PoolsStore;
