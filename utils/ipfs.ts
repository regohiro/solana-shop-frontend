import { create } from "ipfs-http-client";

const ipfsClient = create({ url: process.env.NEXT_PUBLIC_IPFS_CLIENT || "" });

export const uploadImage = async (imageFile: File) => {
  const addedImage = await ipfsClient.add(imageFile);
  const imageUri = `https://ipfs.infura.io/ipfs/${addedImage.path}`;
  return imageUri;
};

export const uploadMetadata = async (
  name: string,
  symbol: string,
  description: string,
  imageUri: string,
) => {
  const metadata = {
    name,
    symbol,
    description,
    image: imageUri,
  };
  const bytes = new TextEncoder().encode(JSON.stringify(metadata));
  const blob = new Blob([bytes], {
    type: "application/json;charset=utf-8",
  });
  const metadataFile = new File([blob], "metadata.json");
  const addedMetadata = await ipfsClient.add(metadataFile);
  const metadataUri = `https://ipfs.infura.io/ipfs/${addedMetadata.path}`;
  return metadataUri;
};
