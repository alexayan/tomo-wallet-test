import { connectWallet } from "@/services/app";
import { ConnectButton } from "@mysten/dapp-kit";
import useCurrentAccount from "@/hooks/useCurrentAccount";
import { useSignPersonalMessage, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useCallback } from "react";
import { Transaction } from "@mysten/sui/transactions";
import {depositCoin, pool} from 'navi-sdk'

export default function Home() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const {mutateAsync: signAndExecuteTransaction} = useSignAndExecuteTransaction();

  const sign = useCallback(async () => {
    const resp = await signPersonalMessage({
      message: new TextEncoder().encode('hello'),
    })
    console.log('resp', resp)
  }, [signPersonalMessage])

  const signAndExecute = useCallback(async () => {
    if (!currentAccount?.address) {
      return;
    }
    const tx = new Transaction();
    const depositAmount = 100000000; // 0.1 Sui
    const [finalCoin] = tx.splitCoins(tx.gas, [depositAmount])
    await depositCoin(tx as any, pool.Sui, finalCoin, depositAmount)
    tx.setSender(currentAccount!.address)
    const resp = await signAndExecuteTransaction({
      transaction: tx as any
    })
    console.log(resp)
  }, [signAndExecuteTransaction, currentAccount?.address])

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen w-screen text-3xl">
      {currentAccount ? (
        <>
          <ConnectButton></ConnectButton>
          <button onClick={sign}>sign message</button>
          <button onClick={signAndExecute}>execute transaction</button>
        </>
      ) : (
        <button onClick={connectWallet}>connect wallet</button>
      )}
    </div>
  );
}
