/*
  Warnings:

  - Added the required column `duration` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nftId` to the `ListingOffer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('REGULAR', 'AUCTION');

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_nftId_fkey";

-- DropIndex
DROP INDEX "Auction_nftId_key";

-- DropIndex
DROP INDEX "Listing_nftId_key";

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "duration" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "ListingOffer" ADD COLUMN     "nftId" TEXT NOT NULL,
ADD COLUMN     "type" "ListingType" NOT NULL DEFAULT 'REGULAR',
ALTER COLUMN "listingId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ListingOffer" ADD CONSTRAINT "ListingOffer_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "Nft"("tokenId") ON DELETE CASCADE ON UPDATE CASCADE;
