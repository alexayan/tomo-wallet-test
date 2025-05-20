import "@/styles/globals.css";
import "@tomo-inc/tomo-web-sdk/style.css";
import type { AppProps } from "next/app";
import { TomoContextProvider } from "@tomo-inc/tomo-web-sdk";
import "@mysten/dapp-kit/dist/index.css";
import { useTomoEmbedWallet } from "@/hooks/useTomoEmbedWallet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
  useAutoConnectWallet,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { ConnectWalletProvider } from "sui-wallets-connect";
import GlobalConnectWallet from "@/components/connect-wallet-modal";
import { useEffect } from "react";
import store, { actions } from "@/stores";
import { Provider } from "react-redux";

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl("mainnet") },
});
const queryClient = new QueryClient();

function GlobalHooks() {
  const currentAccount = useCurrentAccount();
  const autoConnectWallet = useAutoConnectWallet();

  useEffect(() => {
    const address = currentAccount?.address;
    const lastAddress = store.getState().user.currentAccount?.address;
    if (autoConnectWallet === "idle") {
      return;
    }
    if (address && address !== lastAddress) {
      store.dispatch(actions.user.setCurrentAccount({ address }));
    } else if (
      !address &&
      (autoConnectWallet === "attempted" || autoConnectWallet === "disabled")
    ) {
      store.dispatch(actions.user.setCurrentAccount(null));
    }
  }, [currentAccount?.address, autoConnectWallet]);

  useTomoEmbedWallet();

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
          <WalletProvider autoConnect>
            <ConnectWalletProvider logo={"/logo.svg"} termsUrl="">
              <TomoContextProvider
                clientId="fSjHVdz7gaQr12E8Qs8Ng5Mge3xpZTvfpEIDS4CwXLX2BAKlQ2zTe726hoyfD80XK8C1jecwtaXJfbQ1REYTlKlk"
                theme="dark"
                chainTypes={["sui"]}
                _noOtherWallets={true}
              >
                <GlobalHooks></GlobalHooks>
                <Component {...pageProps} />
                <GlobalConnectWallet></GlobalConnectWallet>
              </TomoContextProvider>
            </ConnectWalletProvider>
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </Provider>
  );
}
