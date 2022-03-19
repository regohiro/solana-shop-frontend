import { useRef, useState } from "react";
import React from "react";
import styles from "./NewItem.module.css";
import Button from "@mui/material/Button";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import Checkbox from "@mui/material/Checkbox";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import classNames from "classnames";
import { useStore } from "../../store";
import { useNotify, useProvider } from "../../hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import { Dialog } from "@mui/material";

const NewItem = () => {
  const store = useStore();
  const notify = useNotify();
  const provider = useProvider();
  const { sendTransaction } = useWallet();

  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const symbolInputRef = useRef<HTMLInputElement | null>(null);
  const priceInputRef = useRef<HTMLInputElement | null>(null);
  const supplyInputRef = useRef<HTMLInputElement | null>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [freeze, setFreeze] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFreeze(event.target.checked);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImage(e.target.files[0]);
  };

  const onClickSumbit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = titleInputRef.current?.value;
    const symbol = symbolInputRef.current?.value;
    const description = descriptionInputRef.current?.value;
    const price = priceInputRef.current?.value;
    const supply = supplyInputRef.current?.value;

    try {
      setLoading(true);

      if (!provider) {
        throw new Error("Wallet not connected");
      }
      if (!name || !symbol || !description || !price || !supply || !image) {
        throw new Error("Form not filled completely");
      }
      if (name.length > 30) {
        throw new Error("Name too long");
      }
      if (symbol.length > 10) {
        throw new Error("Symbol too long");
      }

      const { tx, mint } = await store.listItemTx(provider, {
        name,
        symbol,
        description,
        freeze,
        image,
        price: Number(price),
        supply: Number(supply),
      });

      const txid = await sendTransaction(tx, provider.connection, { signers: [mint] });
      notify("info", "List item transaction sent: ", txid);

      await provider.connection.confirmTransaction(txid, "confirmed");
      notify("success", "Transaction successful! ", txid);
    } catch (error: any) {
      console.error(error);
      notify("error", `List item failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      onClose={() => {
        store.setView(null);
      }}
      open={store.view === "newitem"}
    >
      <div className={styles.formBox}>
        <form className={styles.form} onSubmit={onClickSumbit}>
          <div className={styles.duoControl}>
            <div className={classNames(styles.control, styles.leftControl)}>
              <label htmlFor="title">Item Name</label>
              <input
                type="text"
                required
                id="title"
                placeholder="*Max 30 characters"
                ref={titleInputRef}
              />
            </div>
            <div className={classNames(styles.control, styles.rightControl)}>
              <label htmlFor="supply">Item Symbol</label>
              <input
                type="text"
                required
                id="supply"
                placeholder="*Max 10 characters"
                ref={symbolInputRef}
              />
            </div>
          </div>
          <div className={styles.duoControl}>
            <div className={classNames(styles.control, styles.leftControl)}>
              <label htmlFor="image">
                Item Image {image && <CheckCircleIcon fontSize="small" />}
              </label>
              <Button variant="contained" component="label" id={styles.image}>
                <AddAPhotoIcon /> &nbsp; Upload Image
                <input type="file" hidden required onChange={(e) => onFileInputChange(e)} />
              </Button>
            </div>
            <div className={classNames(styles.control, styles.rightControl)}>
              <label htmlFor="settings">Item Settings</label>
              <div>
                <span>
                  <Checkbox
                    checked={freeze}
                    onChange={handleChange}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                </span>
                <span>Disable transfer</span>
              </div>
            </div>
          </div>
          <div className={styles.control}>
            <label htmlFor="description">Item Description</label>
            <textarea id="description" required ref={descriptionInputRef}></textarea>
          </div>
          <div className={styles.duoControl}>
            <div className={classNames(styles.control, styles.leftControl)}>
              <label htmlFor="price">Item Price (USDC)</label>
              <input type="number" required id="price" ref={priceInputRef} />
            </div>
            <div className={classNames(styles.control, styles.rightControl)}>
              <label htmlFor="supply">Item Supply</label>
              <input type="number" required id="supply" ref={supplyInputRef} />
            </div>
          </div>
          <div className={styles.actions}>
            <button>Create Item</button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default NewItem;
