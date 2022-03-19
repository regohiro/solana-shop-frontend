import { BN, utils } from "@project-serum/anchor";
import { Keypair, PublicKey, Secp256k1Program } from "@solana/web3.js";
import secp256k1 from "secp256k1";

export const formatSignerKey = (keypair: Keypair) => {
  const privateKey = keypair.secretKey.slice(0, 32);
  const secp256k1PublicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1);
  const ethAddress = Secp256k1Program.publicKeyToEthAddress(secp256k1PublicKey).toString("hex");

  return {
    privateKey,
    ethAddress,
  };
};

export const decodeData = async (rawdata: string) => {
  interface Data {
    shop: string;
    item: string;
    nonce: string;
    signature: string;
    recoveryId: number;
    reference?: string;
  }

  const data = JSON.parse(rawdata) as Data;

  const shop = new PublicKey(data.shop);
  const item = new PublicKey(data.item);
  const message = new Uint8Array(new BN(data.nonce).toArrayLike(Buffer, "be", 8));
  const signature = new Uint8Array(utils.bytes.bs58.decode(data.signature));
  const recoveryId = data.recoveryId;
  const reference = data.reference ? new PublicKey(data.reference) : undefined;

  return {
    shop,
    item,
    message,
    signature,
    recoveryId,
    reference
  };
};

export const removeDecimal = (num: number) => {
  const str = num.toFixed(0);
  return Number(str);
}