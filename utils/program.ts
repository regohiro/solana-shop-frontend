import * as anchor from "@project-serum/anchor";
import { Provider, BN } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getProgram } from "../web3";
import { adminPDA, itemPDA, shopPDA } from "./accounts";

const systemProgram = SystemProgram.programId;

export const openShop = async (provider: Provider, ethAddress: string, shopToken: PublicKey) => {
  const tx = new Transaction();
  const user = provider.wallet;
  const program = getProgram(provider);
  const [shop] = await shopPDA(user.publicKey);

  tx.add(
    program.instruction.openShop([...anchor.utils.bytes.hex.decode(ethAddress)], {
      accounts: {
        shop,
        shopToken,
        authority: user.publicKey,
        systemProgram,
      },
    }),
  );

  return tx;
};

export const listItem = async (
  provider: Provider,
  mint: PublicKey,
  shop: PublicKey,
  price: BN,
  supply: number,
  freeze: boolean,
) => {
  const tx = new Transaction();
  const program = getProgram(provider);
  const [item] = await itemPDA(mint);
  const [admin] = await adminPDA();
  const user = provider.wallet;

  tx.add(
    program.instruction.listItem(price, supply, freeze, {
      accounts: {
        item,
        mint,
        shop,
        admin,
        authority: user.publicKey,
        systemProgram,
      },
    }),
  );

  return tx;
};
