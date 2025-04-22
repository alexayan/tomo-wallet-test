import "@/styles/globals.css";
import "@tomo-inc/tomo-web-sdk/style.css";
import type { AppProps } from "next/app";
import { TomoContextProvider } from "@tomo-inc/tomo-web-sdk";


import '@mysten/dapp-kit/dist/index.css';



export default function App({ Component, pageProps }: AppProps) {
  return (
    <TomoContextProvider
    theme="light"
    chainTypes={["sui"]}
    clientId="fSjHVdz7gaQr12E8Qs8Ng5Mge3xpZTvfpEIDS4CwXLX2BAKlQ2zTe726hoyfD80XK8C1jecwtaXJfbQ1REYTlKlk"
  >
    <Component {...pageProps} />
  </TomoContextProvider>
  );
}
