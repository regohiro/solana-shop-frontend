import "bootstrap/dist/css/bootstrap.min.css";

import type { AppProps } from "next/app";
import { ReactNode } from "react";
import { SnackbarProvider } from "notistack";
import dynamic from "next/dynamic";

require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");

const WalletConnectionProvider = dynamic<{ children: ReactNode }>(
  () =>
    import("../components/shared/WalletConnectionProvider").then(
      (WalletConnectionProvider) => WalletConnectionProvider,
    ),
  {
    ssr: false,
  },
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletConnectionProvider>
      <SnackbarProvider>
        <Component {...pageProps} />
      </SnackbarProvider>
    </WalletConnectionProvider>
  );
}

export default MyApp;
