import { useWallet } from "@solana/wallet-adapter-react";
import React, { useState } from "react";
import { useStore } from "../../store";
import { useRouter } from "next/router";
import PasswordInput from "./PasswordInput";
import { useProvider, useNotify } from "../../hooks";
import { Dialog } from "@mui/material";
import styles from "./Login.module.css";

const Login: React.FC = () => {
  const { publicKey, signMessage } = useWallet();
  const store = useStore();
  const notify = useNotify();
  const provider = useProvider();

  const [loading, setLoading] = useState(false);

  const onClickLogin = async () => {
    try {
      setLoading(true);
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }
      if (!signMessage) {
        throw new Error("Wallet does not support signing. ");
      }
      await store.signHashedPassword(publicKey, signMessage);
      if (!(provider && (await store.isPasswordCorrect(provider)))) {
        throw new Error("Wrong password");
      }
      store.setView(null);
    } catch (error: any) {
      notify("error", `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      onClose={() => {
        store.setView(null);
      }}
      open={store.view === "login"}
    >
      <div className={styles.loginBox}>
        <h3>Sign in</h3>
        <PasswordInput />
        <button onClick={onClickLogin} disabled={loading} className={styles.loginButton}>
          Verify
        </button>
      </div>
    </Dialog>
  );
};

export default Login;
