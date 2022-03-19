import { useWallet } from "@solana/wallet-adapter-react";
import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import useAsyncEffect from "use-async-effect";
import ConnectButton from "../components/user/ConnectButton";
import { useNotify, useProvider } from "../hooks";
import { useStore } from "../store";
import styles from "../styles/User.module.css";

const User = () => {
  const { publicKey, sendTransaction } = useWallet();
  const notify = useNotify();
  const store = useStore();
  const provider = useProvider();
  const [data, setData] = useState("");
  const [err, setErr] = useState<any>();
  const [msg, setMsg] = useState("");

  useAsyncEffect(async () => {
    if (data) {
      try {
        if (!publicKey || !provider) {
          throw new Error("Wallet not connected");
        }
        setMsg("Ok");
        const tx = await store.buyItemTx(provider, 1, data);
        const txid = await sendTransaction(tx, provider.connection);
        notify("info", "Buy Item transaction sent: ", txid);
  
        await provider.connection.confirmTransaction(txid, "confirmed");
        notify("success", "Transaction successful! ", txid);
      } catch (error: any) {
        setErr(err);
        notify("error", `Buy Item failed: ${error.message}`);
      }
    }
  }, [data, provider]);

  return (
    <div>
      <div className={styles.camera}>
        <h3>Scan QR Code</h3>
        <QrReader
          onResult={(result, error) => {
            if (!!result) {
              setData(result?.getText());
            }
            if (!!error) {
              console.info(error);
            }
          }}
          constraints={{ facingMode: { exact: "environment" } }}
        />
      </div>
      <div className={styles.bottom}>
        <ConnectButton />
      </div>
      <div style={{"maxWidth": "500px", "wordWrap": "break-word"}}>{msg}</div>
      
    </div>
  );
};

export default User;
