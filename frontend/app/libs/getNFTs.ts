export default async function getNFTs(
  issuer: string,
  taxon: string,
  offset = 0,
  filters = "",
  limit = 50
) {
  const response = await fetch(
    `https://optimart.up.railway.app/api/nfts?issuer=${issuer}&taxon=${taxon}&offset=${offset}&limit=${limit}${filters}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }

  return (await response.json())?.results;
}
