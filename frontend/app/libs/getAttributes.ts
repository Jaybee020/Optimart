export default async function getAttributes(issuer: string, taxon: string) {
  const response = await fetch(
    `https://optimart.up.railway.app/api/collections/${issuer}/${taxon}/attributes`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }

  return (await response.json())?.attributes;
}
