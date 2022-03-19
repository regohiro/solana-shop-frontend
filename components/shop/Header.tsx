import React, { useState } from "react";
import styles from "./Header.module.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useStore } from "../../store";
import { accountExists, shopPDA } from "../../utils";
import useAsyncEffect from "use-async-effect";
import { useProvider } from "../../hooks";
import { useWallet } from "@solana/wallet-adapter-react";

const Header: React.FC = () => {
  const { shop, setView } = useStore();
  const provider = useProvider();
  const { connected } = useWallet();
  const [hasOpenedShop, setHasOpenedShop] = useState<boolean | undefined>(undefined);

  useAsyncEffect(async () => {
    //Check login
    if (provider && !shop) {
      const [shop] = await shopPDA(provider.wallet.publicKey);
      const hasOpenedShop = await accountExists(provider, shop);
      if (hasOpenedShop) {
        setView("login");
        setHasOpenedShop(true);
      } else {
        setHasOpenedShop(false);
      }
    }
  }, [provider, shop]);

  const onClickNav = () => {
    if (hasOpenedShop) {
      setView("newitem");
    } else {
      setView("openshop");
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <h1>Solana Shop</h1>
        </div>
        <nav>
          <ul>
            <li>
              <button className={styles.navText} onClick={onClickNav}>
                {hasOpenedShop === true ? "Add New Item" : hasOpenedShop === false && "Open Shop"}
              </button>
            </li>
            <li>
              <div className={styles.connectButton}>
                {connected ? (
                  <WalletMultiButton />
                ) : (
                  <WalletMultiButton>Connect Wallet</WalletMultiButton>
                )}
              </div>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Header;
