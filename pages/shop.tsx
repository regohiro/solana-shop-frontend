import { PublicKey } from "@solana/web3.js";
import Head from "next/head";
import { useMemo } from "react";
import Footer from "../components/shared/Footer";
import Header from "../components/shop/Header";
import Item from "../components/shop/Item";
import Login from "../components/shop/Login";
import NewItem from "../components/shop/NewItem";
import OpenShop from "../components/shop/OpenShop";
import styles from "../styles/Shop.module.css";
import axios from "axios";
import { useStore } from "../store";
import { BN } from "@project-serum/anchor";
import { GetStaticProps } from "next";

interface ItemRes {
  item: string;
  mint: string;
  price: string;
  supply: number;
  freeze: boolean;
  sold: number;
  name: string;
  symbol: string;
  image: string;
  shop: string;
}

interface Props {
  items: ItemRes[];
}

const Shop: React.VFC<Props> = ({ items }) => {
  const shop = useStore((store) => store.shop);

  const itemsList = useMemo(() => {
    if (shop && items.length > 0) {
      return items.filter((item) => item.shop === shop.toBase58()).map((item) => ({
        ...item,
        item: new PublicKey(item.item),
        mint: new PublicKey(item.mint),
        price: new BN(item.price)
      }));
    } else {
      return [];
    }
  }, [shop, items]);

  return (
    <>
      <Head>
        <title>Solana Shop</title>
        <meta name="description" content="Welcome to Solana Shop!" />
        <link rel="icon§" href="/favicon.ico" />
      </Head>
      <Header />
      <NewItem />
      <Login />
      <OpenShop />

      <ul className={styles.list}>
        {itemsList.map((item) => (
          <Item key={item.item.toBase58()} item={item} />
        ))}
      </ul>

      <Footer />
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || "";
  const { data: itemsRes } = await axios.get<ItemRes[]>(`${backendUrl}/items/all`);
  return {
    props: {
      items: itemsRes,
    },
    revalidate: 10
  };
};

export default Shop;
