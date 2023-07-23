/*
  Warnings:

  - Added the required column `status` to the `AuctionBid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateCreated` to the `Collection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `ListingOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sequence` to the `Nft` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('CANCELLED', 'PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ONGOING', 'CANCELLED');

-- AlterTable
ALTER TABLE "AuctionBid" ADD COLUMN     "status" "OfferStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "dateCreated" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "floorPrice" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "status" "ListingStatus" NOT NULL;

-- AlterTable
ALTER TABLE "ListingOffer" ADD COLUMN     "status" "OfferStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Nft" ADD COLUMN     "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "sequence" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "status" "OfferStatus" NOT NULL;
