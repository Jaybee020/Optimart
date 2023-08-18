-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('CANCELLED', 'PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ONGOING', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NftStatus" AS ENUM ('UNLIST', 'LIST', 'AUCTION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "creatorAddr" TEXT NOT NULL,
    "nftId" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'ONGOING',
    "createTxnHash" TEXT NOT NULL,
    "updateTxnHash" TEXT,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingOffer" (
    "id" TEXT NOT NULL,
    "offerorAddr" TEXT NOT NULL,
    "offereeAddr" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "createTxnHash" TEXT NOT NULL,
    "updateTxnHash" TEXT,

    CONSTRAINT "ListingOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "id" TEXT NOT NULL,
    "creatorAddr" TEXT NOT NULL,
    "nftId" TEXT NOT NULL,
    "duration" DECIMAL(65,30) NOT NULL,
    "minBid" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'ONGOING',
    "createTxnHash" TEXT NOT NULL,
    "updateTxnHash" TEXT,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionBid" (
    "id" TEXT NOT NULL,
    "bidderAddr" TEXT NOT NULL,
    "receiverAddr" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "createTxnHash" TEXT NOT NULL,
    "updateTxnHash" TEXT,

    CONSTRAINT "AuctionBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "senderAddr" TEXT NOT NULL,
    "receiverAddr" TEXT NOT NULL,
    "nftId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "createTxnHash" TEXT NOT NULL,
    "updateTxnHash" TEXT,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxon" INTEGER NOT NULL,
    "issuer" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "floorPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3),
    "dailyVolume" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "weeklyVolume" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "monthlyVolume" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "allTimeVolume" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "pictureUrl" TEXT,
    "bannerUrl" TEXT,
    "discordLink" TEXT,
    "twitterLink" TEXT,
    "instagramLink" TEXT,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nft" (
    "id" TEXT NOT NULL,
    "uri" TEXT,
    "tokenId" TEXT NOT NULL,
    "owner" TEXT,
    "imageUrl" TEXT,
    "attributes" JSONB,
    "collectionId" TEXT,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sequence" INTEGER NOT NULL,
    "status" "NftStatus" NOT NULL DEFAULT 'UNLIST',

    CONSTRAINT "Nft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_nftId_key" ON "Listing"("nftId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingOffer_createTxnHash_key" ON "ListingOffer"("createTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "ListingOffer_updateTxnHash_key" ON "ListingOffer"("updateTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_nftId_key" ON "Auction"("nftId");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_createTxnHash_key" ON "Auction"("createTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_updateTxnHash_key" ON "Auction"("updateTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionBid_createTxnHash_key" ON "AuctionBid"("createTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionBid_updateTxnHash_key" ON "AuctionBid"("updateTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_createTxnHash_key" ON "Offer"("createTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_updateTxnHash_key" ON "Offer"("updateTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_collectionId_key" ON "Collection"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_issuer_taxon_key" ON "Collection"("issuer", "taxon");

-- CreateIndex
CREATE UNIQUE INDEX "Nft_tokenId_key" ON "Nft"("tokenId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "Nft"("tokenId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_creatorAddr_fkey" FOREIGN KEY ("creatorAddr") REFERENCES "User"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingOffer" ADD CONSTRAINT "ListingOffer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingOffer" ADD CONSTRAINT "ListingOffer_offereeAddr_fkey" FOREIGN KEY ("offereeAddr") REFERENCES "User"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingOffer" ADD CONSTRAINT "ListingOffer_offerorAddr_fkey" FOREIGN KEY ("offerorAddr") REFERENCES "User"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "Nft"("tokenId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_creatorAddr_fkey" FOREIGN KEY ("creatorAddr") REFERENCES "User"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionBid" ADD CONSTRAINT "AuctionBid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionBid" ADD CONSTRAINT "AuctionBid_bidderAddr_fkey" FOREIGN KEY ("bidderAddr") REFERENCES "User"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionBid" ADD CONSTRAINT "AuctionBid_receiverAddr_fkey" FOREIGN KEY ("receiverAddr") REFERENCES "User"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "Nft"("tokenId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_senderAddr_fkey" FOREIGN KEY ("senderAddr") REFERENCES "User"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_receiverAddr_fkey" FOREIGN KEY ("receiverAddr") REFERENCES "User"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nft" ADD CONSTRAINT "Nft_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("collectionId") ON DELETE CASCADE ON UPDATE CASCADE;
