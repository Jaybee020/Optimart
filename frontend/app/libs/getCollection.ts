export default async function getCollection(issuer: string, taxon: string) {
  const response = await fetch(
    `https://optimart.up.railway.app/api/collections/${issuer}/${taxon}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }

  return await response.json();
}
