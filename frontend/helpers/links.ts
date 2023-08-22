const convertToIpfsLink = (ipfsUri: string) => {
  const baseIpfsGatewayUrl = "https://ipfs.io/ipfs/";
  const ipfsHash = ipfsUri?.replace("ipfs://", "");
  return `${baseIpfsGatewayUrl}${ipfsHash}`;
};

export { convertToIpfsLink };
