import { FunctionComponent, useState, useEffect, useRef } from "react";
import { ConnectModal } from "sui-wallets-connect";
import events from "@/services/events";
import store from "@/stores";

const GlobalConnectWallet: FunctionComponent = function () {
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const ctxRef = useRef<{
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  }>({});

  useEffect(() => {
    if (!connectModalOpen && ctxRef.current) {
      setTimeout(() => {
        const currentAccount = store.getState().user.currentAccount;
        if (currentAccount && ctxRef.current.onSuccess) {
          ctxRef.current.onSuccess?.(currentAccount);
        }
      }, 50);
    }
  }, [connectModalOpen]);

  useEffect(() => {
    function handleConnectWallet(data: any) {
      setConnectModalOpen(true);
      ctxRef.current.onSuccess = data.onSuccess;
      ctxRef.current.onError = data.onError;
    }
    events.on("connectWallet", handleConnectWallet);
    return () => {
      events.off("connectWallet", handleConnectWallet);
    };
  }, []);

  return (
    <ConnectModal
      trigger={<div></div>}
      open={connectModalOpen}
      onOpenChange={(isOpen) => setConnectModalOpen(isOpen)}
    />
  );
};

export default GlobalConnectWallet;
