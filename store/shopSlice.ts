import * as anchor from "@project-serum/anchor";
import { Provider } from "@project-serum/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { sign } from "tweetnacl";
import keccak256 from "keccak256";
import { isEqual } from "lodash";
import { getProgram } from "../web3";
import {
  accountExists,
  accounts,
  createATA,
  formatSignerKey,
  getATA,
  openShop,
  shopPDA,
} from "../utils";
import { StoreSlice } from "./types";

export interface ShopSlice {
  view: "newitem" | "openshop" | "login" | null;
  signerKeypair?: Keypair;
  hashedPassword?: Buffer;
  shop?: PublicKey;
  setView: (view: "newitem" | "openshop" | "login" | null) => void;
  setHashedPassword: (hashedPassword?: Buffer) => void;
  signHashedPassword: (
    publicKey: PublicKey,
    signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  ) => Promise<Keypair>;
  isPasswordCorrect: (provider: Provider) => Promise<boolean>;
  openShopTx: (provider: Provider) => Promise<Transaction>;
}

const shopSlice: StoreSlice<ShopSlice> = (set, get) => ({
  view: null,
  setView: (view) => set(() => ({ view })),
  setHashedPassword: (hp) => set(() => ({ hashedPassword: hp })),
  signHashedPassword: async (publicKey, signMessage) => {
    const hashedPassword = get().hashedPassword!;
    const message = new TextEncoder().encode(hashedPassword.toString());
    const signature = await signMessage(message);
    if (!sign.detached.verify(message, signature, publicKey.toBytes())) {
      throw new Error("Invalid Signature");
    }
    const seed = new Uint8Array(keccak256(Buffer.from(signature)));
    const signerKeypair = Keypair.fromSeed(seed);
    set(() => ({
      signerKeypair,
    }));
    return signerKeypair;
  },
  isPasswordCorrect: async (provider) => {
    const program = getProgram(provider);
    const { ethAddress } = formatSignerKey(get().signerKeypair!);
    const [shop] = await shopPDA(provider.wallet.publicKey);
    const shopAccount = await program.account.shop.fetch(shop);
    if (isEqual(shopAccount.signerAddress, [...anchor.utils.bytes.hex.decode(ethAddress)])) {
      set(() => ({
        shop,
      }));
      return true;
    } else {
      set(() => ({
        signerKeypair: undefined,
      }));
      return false;
    }
  },
  openShopTx: async (provider) => {
    const { wallet } = provider;
    const tx = new Transaction();
    const shopToken = await getATA(wallet.publicKey, accounts.tokenMint);
    const [shop] = await shopPDA(wallet.publicKey);
    const { ethAddress } = formatSignerKey(get().signerKeypair!);

    //Create payment token account
    if (!(await accountExists(provider, shopToken))) {
      tx.add(await createATA(wallet.publicKey, accounts.tokenMint));
    }

    //Open shop
    const openShopTx = await openShop(provider, ethAddress, shopToken);
    tx.add(openShopTx);

    set(() => ({
      shop,
    }));

    return tx;
  },
});

export default shopSlice;
