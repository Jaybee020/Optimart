export default async function getNFT(token_id: string) {
  const response = await fetch(
    `https://optimart.up.railway.app/api/nfts/${token_id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }

  return (await response.json()) ?? null;
}
