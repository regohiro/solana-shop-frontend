import {
  CreateMetadata,
  Metadata,
  MetadataDataData,
} from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from "@project-serum/anchor";
import { Provider } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AuthorityType,
  MintLayout,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";

export const accountExists = async (
  provider: Provider,
  account: PublicKey,
): Promise<boolean> => {
  const info = await provider.connection.getAccountInfo(account);
  if (info === null) {
    return false;
  } else {
    return true;
  }
};

export const getATA = async (user: PublicKey, mintAccount: PublicKey): Promise<PublicKey> => {
  const tokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintAccount,
    user,
  );
  return tokenAccount;
};

export const createATA = async (user: PublicKey, mintAccount: PublicKey): Promise<Transaction> => {
  const tx = new Transaction();

  const tokenAccount = await getATA(user, mintAccount);

  tx.add(
    Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mintAccount,
      tokenAccount,
      user,
      user,
    ),
  );
  return tx;
};

export const createMint = async (
  provider: Provider,
) => {
  let tx = new Transaction();
  const mint = Keypair.generate();
  const rent = await provider.connection.getMinimumBalanceForRentExemption(MintLayout.span);

  tx.add(
    anchor.web3.SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: mint.publicKey,
      space: MintLayout.span,
      lamports: rent,
      programId: TOKEN_PROGRAM_ID,
    }),
  );

  tx.add(
    Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      0,
      provider.wallet.publicKey,
      provider.wallet.publicKey,
    ),
  );

  return {
    tx,
    mint,
  };
};

export const setTokenAuthority = async (
  provider: Provider,
  mint: PublicKey,
  newAuthority: PublicKey,
  authorityType: AuthorityType
) => {
  const tx = new Transaction();

  tx.add(
    Token.createSetAuthorityInstruction(
      TOKEN_PROGRAM_ID,
      mint,
      newAuthority,
      authorityType,
      provider.wallet.publicKey,
      [],
    ),
  );

  return tx;
};

export const attachMetadata = async (
  { wallet }: Provider,
  mint: PublicKey,
  name: string,
  symbol: string,
  metadataUri: string,
) => {
  const tx = new Transaction();
  const metadataAccount = await Metadata.getPDA(mint);

  tx.add(
    new CreateMetadata(
      { feePayer: wallet.publicKey },
      {
        metadata: metadataAccount,
        metadataData: new MetadataDataData({
          name,
          symbol,
          uri: metadataUri,
          sellerFeeBasisPoints: 0,
          creators: null,
        }),
        updateAuthority: wallet.publicKey,
        mint,
        mintAuthority: wallet.publicKey,
      },
    ),
  );

  return tx;
};
