import store from "@/stores";
import events from "@/services/events";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export async function connectWallet(): Promise<string> {
  const currentAccount = store.getState().user.currentAccount;
  if (currentAccount) {
    return currentAccount.address;
  }
  return new Promise((resolve, reject) => {
    events.emit("connectWallet", {
      onSuccess: (data) => {
        resolve(data.address);
      },
      onError: (error) => {
        reject(error);
      },
    });
  });
}


export async function getAllUserCoins(client: SuiClient, address: string) {
  let cursor: string | undefined | null = null;
  const allCoinDatas: any[] = [];
  do {
    const { data, nextCursor } = await client.getAllCoins({
      owner: address,
      cursor,
      limit: 100,
    });
    if (!data || !data.length) {
      break;
    }
    allCoinDatas.push(
      ...data
    );
    cursor = nextCursor;
  } while (cursor);
  return allCoinDatas
}


export function returnMergedCoins(
  txb: Transaction,
  coins: any[],
  amount: number
) {
  if (coins.length < 2) {
    return txb.object(coins[0].coinObjectId);
  }

  let mergedBalance = 0;
  const mergeList: string[] = [];
  coins = coins.filter((c) => {
    return Number(c.balance) > 0;
  });
  coins
    .sort((a, b) => Number(b.balance) - Number(a.balance))
    .slice(1)
    .forEach((coin) => {
      if (mergedBalance >= amount) {
        return;
      }
      mergedBalance += Number(coin.balance);
      mergeList.push(coin.coinObjectId);
    });
  const baseObj = coins[0].coinObjectId;
  if (mergeList.length > 0) {
    txb.mergeCoins(baseObj, mergeList);
  }

  return txb.object(baseObj);
}