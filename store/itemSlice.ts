import { getProgram } from "./../web3/index";
import { Provider, utils, BN } from "@project-serum/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
  adminPDA,
  attachMetadata,
  createMint,
  listItem,
  setTokenAuthority,
  shopPDA,
  toBN,
  uploadImage,
  uploadMetadata,
} from "../utils";
import { StoreSlice } from "./types";
import keccak256 from "keccak256";
import secp256k1 from "secp256k1";

export interface ItemMetadata {
  name: string;
  symbol: string;
  image: File;
  freeze: boolean;
  description: string;
  price: number;
  supply: number;
}

export interface ItemSlice {
  listItemTx: (provider: Provider, itemMetadata: ItemMetadata) => Promise<{tx: Transaction, mint: Keypair}>;
  signItemSignature: (provider: Provider) => Promise<{
    shop: string,
    nonce: string;
    signature: string;
    recoveryId: number;
  }>;
}

const itemSlice: StoreSlice<ItemSlice> = (set, get) => ({
  listItemTx: async (provider, { name, symbol, image, freeze, description, price, supply }) => {
    const shop = get().shop;
    if (!shop) {
      throw new Error("Login first");
    }

    const tx = new Transaction({
      recentBlockhash: (await provider.connection.getLatestBlockhash("finalized")).blockhash,
      feePayer: provider.wallet.publicKey,
    });

    //Upload metadata to IPFS
    console.log("ipfs");
    const imageUri = await uploadImage(image);
    const metadataUri = await uploadMetadata(name, symbol, description, imageUri);

    //Create mint account
    console.log("mint account");
    const [admin] = await adminPDA();
    const { tx: mintTx, mint } = await createMint(provider);
    console.log("mint: ", mint.publicKey.toBase58());
    tx.add(mintTx);

    //Attach metadata
    console.log("metadata");
    const metadataTx = await attachMetadata(provider, mint.publicKey, name, symbol, metadataUri);
    tx.add(metadataTx);

    //Set mint authority
    const mintAuthorityTx = await setTokenAuthority(provider, mint.publicKey, admin, "MintTokens");
    tx.add(mintAuthorityTx);

    //Set freeze authority if set to true
    if (freeze) {
      const freezeAuthorityTx = await setTokenAuthority(
        provider,
        mint.publicKey,
        admin,
        "FreezeAccount",
      );
      tx.add(freezeAuthorityTx);
    }

    //List item
    console.log("item");
    const listItemTx = await listItem(
      provider,
      mint.publicKey,
      shop,
      toBN(price, 9),
      supply,
      freeze,
    );
    tx.add(listItemTx);

    return {
      tx, mint
    };
  },
  signItemSignature: async (provider) => {
    const shop = get().shop;
    const signer = get().signerKeypair;
    if (!shop || !signer) {
      throw new Error("Login first");
    }
    const program = getProgram(provider);
    const { nonce } = await program.account.shop.fetch(shop);
    const message = new Uint8Array(nonce.toArrayLike(Buffer, "be", 8));
    const hash = keccak256(Buffer.from(message));
    const sig = secp256k1.ecdsaSign(hash, signer.secretKey.slice(0, 32));

    const data = {
      shop: shop.toBase58(),
      nonce: nonce.toString(),
      signature: utils.bytes.bs58.encode(sig.signature),
      recoveryId: sig.recid,
    };

    return data;
  },
});

export default itemSlice;
