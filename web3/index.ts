import { Provider, Program } from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { ConfirmOptions, Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { IDL, SolanaShop } from "./SolanaShop";

export const getProvider = (anchorWallet: AnchorWallet, connection: Connection): Provider => {
  const opts: ConfirmOptions = {
    preflightCommitment: "confirmed",
  };
  const provider = new Provider(connection, anchorWallet, opts);
  return provider;
}

export const getReadOnlyProvider = (connection: Connection): Provider => {
  const wallet = <AnchorWallet>{}; 
  const provider = getProvider(wallet ,connection);
  return provider;
}

export const getProgram = (
  provider: Provider
): Program<SolanaShop> => {
  const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || "");
  const program = new Program<SolanaShop>(IDL, programId, provider);
  return program;
}