import Head from "next/head";
import { useRouter } from "next/router";

const Home: React.FC = () => {
  const router = useRouter();

  const onClickShop = () => {
    router.push("/shop");
  }

  const onClickUser = () => {
    router.push("/user");
  }

  return (
    <>
      <Head>
        <title>Solana Shop</title>
        <meta name="description" content="Welcome to Solana Shop!" />
        <link rel="icon§" href="/favicon.ico" />
      </Head>

      <main>
        <button onClick={onClickShop}>Shop</button>
        <button onClick={onClickUser}>User</button>
      </main>
    </>
  );
};

export default Home;
