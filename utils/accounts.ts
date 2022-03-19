import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

const ADMIN_BASE = anchor.utils.bytes.utf8.encode("admin");
const SHOP_BASE = anchor.utils.bytes.utf8.encode("shop");
const ITEM_BASE = anchor.utils.bytes.utf8.encode("item");

export const accounts = {
  program: new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || ""),
  tokenMint: new PublicKey(process.env.NEXT_PUBLIC_TOKEN_MINT || ""),
};

export const adminPDA = async () => {
  return await PublicKey.findProgramAddress([ADMIN_BASE], accounts.program);
};

export const shopPDA = async (user: PublicKey) => {
  return await PublicKey.findProgramAddress([SHOP_BASE, user.toBuffer()], accounts.program);
};

export const itemPDA = async (user: PublicKey) => {
  return await PublicKey.findProgramAddress([ITEM_BASE, user.toBuffer()], accounts.program);
};

