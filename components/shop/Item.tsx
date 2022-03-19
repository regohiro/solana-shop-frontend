import { BN } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { useNotify, useProvider } from "../../hooks";
import { useStore } from "../../store";
import { fromBN } from "../../utils";
import Card from "../Card";
import styles from "./Item.module.css";
import QRCode from "react-qr-code";
import Dialog from "@mui/material/Dialog";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface ItemItem {
  item: PublicKey;
  mint: PublicKey;
  price: BN;
  supply: number;
  freeze: boolean;
  sold: number;
  name: string;
  symbol: string;
  image: string;
}

interface ItemProps {
  key: string;
  item: ItemItem;
}

const Item: React.FC<ItemProps> = ({
  item: { item, name, symbol, image, price, supply, sold },
}) => {
  const [qrMessage, setQrMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [confirmations, setConfirmations] = useState(0);
  const [reference, setReference] = useState<PublicKey | undefined>(undefined);
  const [confirming, setConfirming] = useState(false);
  const progress = useMemo(() => (confirmations / 10) * 100, [confirmations]);
  const notify = useNotify();
  const store = useStore();
  const provider = useProvider();

  const onClickBuy = async () => {
    try {
      if (!provider) {
        throw new Error("Wallet not connected");
      }
      if (sold === supply) {
        throw new Error("Out of stock");
      }
      const signatureData = await store.signItemSignature(provider);
      const reference = Keypair.generate().publicKey;
      const qrData = { ...signatureData, item: item.toBase58(), reference: reference.toBase58() };
      setQrMessage(JSON.stringify(qrData));
      setReference(reference);
      console.log("reference: ", reference.toBase58());
    } catch (error: any) {
      notify("error", `Shop Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (qrMessage && provider && reference) {
      const interval = setInterval(async () => {
        console.log("searching");
        try {
          const signature = await provider.connection.getSignaturesForAddress(
            reference,
            undefined,
            "confirmed",
          );
          if (signature && signature.length > 0) {
            console.log("found");
            clearInterval(interval);
            setSignature(signature[signature.length - 1].signature);
          }
        } catch (error: any) {
          console.error(error);
        }
      }, 250);
      return () => {
        clearInterval(interval);
      };
    }
  }, [qrMessage, provider, reference]);

  useEffect(() => {
    if (signature && provider && confirming === false) {
      setConfirming(true);
      const interval = setInterval(async () => {
        try {
          const res = await provider.connection.getSignatureStatus(signature);
          const status = res.value;
          if (status?.confirmationStatus === "finalized" || status?.confirmations === 10) {
            clearInterval(interval);
            setConfirmations(0);
            setQrMessage("");
            setConfirming(false);
          } else {
            setConfirmations(status?.confirmations || 0);
          }
        } catch (error: any) {
          console.error(error);
        }
      }, 100);
      return () => {
        setConfirming(false);
        clearInterval(interval);
      };
    }
  }, [signature, provider]);

  return (
    <li className={styles.item}>
      <Card>
        <div className={styles.image}>
          <img src={image} alt={name} />
        </div>
        <div className={styles.content}>
          <h3>
            {name} ({symbol})
          </h3>
          <h4>
            Price: {fromBN(price, 9).toFixed(2)} USDC, Sold: {sold}/{supply}
          </h4>
        </div>
        <div className={styles.actions}>
          <button onClick={onClickBuy}>Buy</button>
          <Dialog
            onClose={() => {
              setQrMessage("");
            }}
            open={qrMessage !== ""}
          >
            <div className={styles.QRBox}>
              {progress === 0 ? (
                <QRCode value={qrMessage} size={350} />
              ) : (
                <CircularProgressbar value={progress} text={`${progress}%`} />
              )}
            </div>
          </Dialog>
        </div>
      </Card>
    </li>
  );
};

export default Item;
