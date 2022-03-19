import { Provider, utils } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  PublicKey,
  Secp256k1Program,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { accountExists, accounts, adminPDA, createATA, decodeData, getATA } from "../utils";
import { getProgram } from "../web3";
import { StoreSlice } from "./types";

export interface UserSlice {
  buyItemTx: (provider: Provider, amount: number, data: string) => Promise<Transaction>;
}

const userSlice: StoreSlice<UserSlice> = (set, get) => ({
  buyItemTx: async (provider, amount, data) => {
    const tx = new Transaction();
    const user = provider.wallet.publicKey;
    const program = getProgram(provider);

    const { shop, item, message, signature, recoveryId, reference } = await decodeData(data);

    const [shopAccountInfo, itemAccountInfo] = await Promise.all([
      program.account.shop.fetch(shop),
      program.account.item.fetch(item),
    ]);
    const [admin] = await adminPDA();
    const mint = itemAccountInfo.mint;
    const userToken = await getATA(user, accounts.tokenMint);
    const userItem = await getATA(user, mint);
    const shopAuthority = shopAccountInfo.authority;
    const shopToken = await getATA(shopAuthority, accounts.tokenMint);
    const ethAddress = utils.bytes.hex.encode(Buffer.from(shopAccountInfo.signerAddress));

    //Create user item account if does not exist
    if (!(await accountExists(provider, userItem))) {
      tx.add(await createATA(user, mint));
    }

    //Signature verification tx
    tx.add(
      Secp256k1Program.createInstructionWithEthAddress({
        ethAddress,
        message,
        signature,
        recoveryId,
      }),
    );

    //Buy item tx
    const ix = program.instruction.buyItem(amount, {
      accounts: {
        shop,
        item,
        admin,
        mint,
        user,
        userToken,
        userItem,
        shopToken,
        shopAuthority,
        sysvarInstruction: SYSVAR_INSTRUCTIONS_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      }
    });

    if (reference) {
      ix.keys.push({ pubkey: reference, isWritable: false, isSigner: false });
    }

    tx.add(ix);

    return tx;
  },
});

export default userSlice;
