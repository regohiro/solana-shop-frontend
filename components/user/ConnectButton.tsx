import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React from "react";
import styles from "./ConnectButton.module.css";

const ConnectButton = () => {
  const { connected } = useWallet();

  return (
    <div className={styles.buttonBox}>
      {connected ? (
        <WalletMultiButton style={{"transform": "scale(1.7)"}} />
      ) : (
        <WalletMultiButton style={{"transform": "scale(1.7)"}}>Connect Wallet</WalletMultiButton>
      )}
    </div>
  );
};

export default ConnectButton;
