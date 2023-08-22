export default async function getCollections(
  offset = 0,
  timeframe = "total_volume",
  limit = 20
) {
  const response = await fetch(
    `https://optimart.up.railway.app/api/collections?limit=${limit}&offset=${offset}&order_by=-${timeframe}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }

  const data = await response.json();

  return data?.results;
}
