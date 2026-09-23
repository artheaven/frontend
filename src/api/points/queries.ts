import { apiFetch } from "@/demo/api";
import { ICHAIN, LockApi, Reward, Task } from "@/types";
import { endpoint } from "../pools/queries";
import { formatBigNumber } from "@/utils/formatBigNumber";

export const getPredictedPoints = async (
  token: string,
  tokenAmount: number,
  daysOfLock: number,
  network: ICHAIN
) => {
  try {
    const response = await apiFetch(
      `${endpoint}/lending/calculate-points/${token}/${tokenAmount}/${daysOfLock}?network=${network}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: number = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Failed to fetch predicted points: ${error.message}`);
    throw error;
  }
};

export const getEarnedPoints = async (address: string) => {
  try {
    const response = await apiFetch(`${endpoint}/lending/user-points/${address}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: number = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Failed to fetch earned points: ${error.message}`);
    throw error;
  }
};

export const getTasks = async (address: string) => {
  try {
    const response = await apiFetch(`${endpoint}/lending/user-tasks/${address}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Task[] = await response.json();
    return data.toSorted((a, b) => {
      if (a.name === "Connect wallet") return -1;
      if (b.name === "Connect wallet") return 1;
      return 0;
    });
  } catch (error: any) {
    console.error(`Failed to fetch tasks: ${error.message}`);
    throw error;
  }
};

export const completeTask = async (address: string, taskName: string) => {
  try {
    const response = await apiFetch(`${endpoint}/lending/complete-task/${address}/${taskName}`, {
      method: "POST"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Failed to complete task: ${error.message}`);
    throw error;
  }
};

export const getRewards = async (address: string) => {
  try {
    const response = await apiFetch(`${endpoint}/lending/rewards-claim-details/${address}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Reward = await response.json();
    return {
      ...data,
      claimable: data.claimable ? formatBigNumber(BigInt(data.claimable), 18) : null
    };
  } catch (error: any) {
    console.error(`Failed to fetch rewards: ${error.message}`);
    throw error;
  }
};

export const getLocks = async (address: string, tokenName?: string) => {
  try {
    const response = await apiFetch(`${endpoint}/lending/user-locks/${address}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: LockApi[] = await response.json();

    const unlockedData = data.filter(lock => lock.unlockedTime === 0);

    if (tokenName) {
      return unlockedData.filter(lock => lock.token === tokenName);
    }

    return unlockedData;
  } catch (error: any) {
    console.error(`Failed to fetch locks: ${error.message}`);
    console.error(error);
    throw error;
  }
};
