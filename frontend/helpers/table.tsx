import { CollectionTableLabel } from "@typings";

const homeTableConfig: CollectionTableLabel[] = [
  {
    label: "Collection",
    type: "collection",
    key: "name",
    imgKey: "image_url",
  },
  {
    label: "Floor",
    type: "floor",
    key: "floor_price",
    format: true,
    showXrpIcon: true,
  },
  {
    label: "Total Volume",
    type: "volume",
    key: "total_volume",
    format: true,
    showXrpIcon: true,
  },
  {
    label: "Monthly volume",
    type: "volume",
    key: "monthly_volume",
    format: true,
    showXrpIcon: true,
  },
  {
    label: "Created By",
    type: "adress",
    key: "address",
    format: true,
  },
];
const homeTableMobileConfig: CollectionTableLabel[] = [
  {
    label: "Collection",
    type: "collection",
    key: "name",
    imgKey: "image_url",
  },
  {
    label: "Floor",
    type: "floor",
    key: "floor_price",
    format: true,
    showXrpIcon: true,
  },
  {
    label: "Total Volume",
    type: "volume",
    key: "total_volume",
    format: true,
    showXrpIcon: true,
  },
];

const nftTableConfig: CollectionTableLabel[] = [
  {
    label: "NFT",
    type: "collection",
    key: "name",
    imgKey: "image_url",
    cellClassname: "nft-list-cell",
    headerClassname: "nft-list-header",
  },
  {
    label: "Price",
    type: "price",
    key: "price",
    format: true,
    showXrpIcon: true,
  },
  {
    label: "Rank",
    type: "rank",
    key: "sequence",
  },
  {
    label: "Status",
    type: "status",
    key: "status",
  },
  {
    label: "Owner",
    type: "adress",
    key: "address",
    format: true,
  },
  // {
  //   label: "Listed",
  //   type: "listed",
  //   key: "listed",
  //   icon: <p>16h</p>,
  // },
];

const profileTableCollected: CollectionTableLabel[] = [
  {
    label: "NFT",
    type: "collection",
    key: "collection",
    imgKey: "image",
    prefix: {
      key: "rank",
      className: "nft-rank",
    },
    cellClassname: "nft-list-cell",
    headerClassname: "nft-list-header",
  },
  {
    label: "Floor Price",
    type: "price",
    key: "floor",
    format: true,
    showXrpIcon: true,
  },
  {
    label: "Top Offer",
    type: "top-offer",
    key: "floor",
    format: true,
    showXrpIcon: true,
  },
  {
    label: "Status",
    type: "status",
    key: "status",
  },
  {
    label: "Cost",
    type: "price",
    key: "floor",
    format: true,
    showXrpIcon: true,
  },
];

const profileTableActivity: CollectionTableLabel[] = [
  {
    label: "Event",
    type: "price",
    key: "event",
  },
  {
    label: "NFT",
    type: "collection",
    key: "collection",
    imgKey: "image",
    prefix: {
      key: "rank",
      className: "nft-rank",
    },
    cellClassname: "nft-list-cell",
    headerClassname: "nft-list-header",
  },
  {
    label: "Price",
    type: "price",
    key: "floor",
    format: true,
    showXrpIcon: true,
  },
  {
    label: "Created",
    type: "date_created",
    key: "date_created",
  },
  {
    label: "",
    type: "transfer",
    key: "transfer",
  },
];

export {
  nftTableConfig,
  homeTableConfig,
  homeTableMobileConfig,

  //
  profileTableActivity,
  profileTableCollected,
};

export const mockdata = [
  {
    rank: 1,
    collection: "Azuki",
    floor: 4.72,
    volume: 997,
    owners: 5564,
    items: 10000,
    owner: "rhAf...Gu6J",
    date_created: "July 25, 2023",
    event: "mint",
    status: "listed",
    nft: "https://i.seadn.io/gcs/files/355271bd9193905ea20e25f4cca0bf02.png?auto=format&dpr=1&w=3840",
    image:
      "https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT?auto=format&dpr=1&w=136&h=136&fr=1",
  },
  {
    rank: 2,
    collection: "CryptoPunks",
    floor: 30.72,
    volume: 399,
    owners: 4367,
    items: 10000,
    owner: "rhAf...Gu6J",
    date_created: "July 25, 2023",
    event: "transfer",
    status: "not listed",
    nft: "https://i.seadn.io/gcs/files/c31a3d8d7e823477631664d499bbf363.png?auto=format&dpr=1&w=3840",
    image:
      "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=136&h=136&fr=1",
  },
  {
    rank: 3,
    collection: "Art Blocks",
    floor: 25.36,
    volume: 567,
    owners: 2788,
    items: 10000,
    owner: "rhAf...Gu6J",
    date_created: "July 25, 2023",
    event: "sale",
    status: "listed",
    nft: "https://i.seadn.io/gcs/files/be81fe5e8e4317c40e4239f844d20de9.png?auto=format&dpr=1&w=3840",
    image:
      "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=136&h=136&fr=1",
  },
  {
    rank: 4,
    collection: "Bored Ape Yacht Club",
    floor: 12.48,
    volume: 1002,
    owners: 1798,
    items: 10000,
    owner: "rhAf...Gu6J",
    date_created: "July 25, 2023",
    event: "mint",
    status: "not listed",
    nft: "https://i.seadn.io/gcs/files/b4f9c9dada8cdd73da8b332ba0237fdb.png?auto=format&dpr=1&w=3840",
    image:
      "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=136&h=136&fr=1",
  },
  {
    rank: 5,
    collection: "Decentraland Estates",
    floor: 8.15,
    volume: 120,
    owners: 456,
    items: 10000,
    owner: "rhAf...Gu6J",
    date_created: "July 25, 2023",
    event: "list",
    status: "listed",
    nft: "https://i.seadn.io/gcs/files/a456b0cb2e2e5163f8a574ed1905a9e7.png?auto=format&dpr=1&w=3840",
    image:
      "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=136&h=136&fr=1",
  },
  {
    rank: 6,
    collection: "Rarible",
    floor: 2.97,
    volume: 789,
    owners: 3456,
    items: 10000,
    owner: "rhAf...Gu6J",
    date_created: "July 25, 2023",
    event: "transfer",
    status: "not listed",
    nft: "https://i.seadn.io/gcs/files/355271bd9193905ea20e25f4cca0bf02.png?auto=format&dpr=1&w=3840",
    image:
      "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=136&h=136&fr=1",
  },
  {
    rank: 7,
    collection: "The Sandbox Land",
    floor: 6.8,
    volume: 452,
    owners: 2345,
    items: 10000,
    owner: "rhAf...Gu6J",
    date_created: "July 25, 2023",
    event: "transfer",
    status: "not listed",
    nft: "https://i.seadn.io/gcs/files/c31a3d8d7e823477631664d499bbf363.png?auto=format&dpr=1&w=3840",
    image:
      "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=136&h=136&fr=1",
  },
  {
    rank: 8,
    collection: "Meebits",
    floor: 18.25,
    volume: 260,
    owners: 986,
    items: 10000,
    owner: "rhAf...Gu6J",
    date_created: "July 25, 2023",
    event: "sale",
    status: "listed",
    nft: "https://i.seadn.io/gcs/files/be81fe5e8e4317c40e4239f844d20de9.png?auto=format&dpr=1&w=3840",
    image:
      "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=136&h=136&fr=1",
  },
  {
    rank: 9,
    collection: "Superrare",
    floor: 35.09,
    volume: 125,
    owners: 457,
    items: 10000,
    owner: "rhAf...Gu6J",
    date_created: "July 25, 2023",
    event: "mint",
    status: "not listed",
    nft: "https://i.seadn.io/gcs/files/b4f9c9dada8cdd73da8b332ba0237fdb.png?auto=format&dpr=1&w=3840",
    image:
      "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=136&h=136&fr=1",
  },
  {
    rank: 10,
    collection: "Avastars",
    floor: 14.77,
    volume: 310,
    owners: 789,
    items: 10000,
    owner: "rhAf...Gu6J",
    date_created: "July 25, 2023",
    event: "list",
    status: "listed",
    nft: "https://i.seadn.io/gcs/files/a456b0cb2e2e5163f8a574ed1905a9e7.png?auto=format&dpr=1&w=3840",
    image:
      "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=136&h=136&fr=1",
  },
];
