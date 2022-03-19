import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { getProvider } from "../web3";

export const useProvider = () => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  return useMemo(() => {
    if (anchorWallet) {
      const provider = getProvider(anchorWallet, connection);
      return provider;
    }
    return undefined;
  }, [anchorWallet, connection]);
};
