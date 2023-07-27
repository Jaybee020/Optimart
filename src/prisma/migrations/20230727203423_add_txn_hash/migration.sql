/*
  Warnings:

  - The `status` column on the `Auction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `dateCreated` on the `Collection` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[createTxnHash]` on the table `Auction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updateTxnHash]` on the table `Auction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createTxnHash]` on the table `AuctionBid` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updateTxnHash]` on the table `AuctionBid` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createTxnHash]` on the table `ListingOffer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updateTxnHash]` on the table `ListingOffer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[createTxnHash]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updateTxnHash]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createTxnHash` to the `Auction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createTxnHash` to the `AuctionBid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createTxnHash` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createTxnHash` to the `ListingOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createTxnHash` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "createTxnHash" TEXT NOT NULL,
ADD COLUMN     "updateTxnHash" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ListingStatus" NOT NULL DEFAULT 'ONGOING';

-- AlterTable
ALTER TABLE "AuctionBid" ADD COLUMN     "createTxnHash" TEXT NOT NULL,
ADD COLUMN     "updateTxnHash" TEXT;

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "dateCreated",
ADD COLUMN     "createdAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "createTxnHash" TEXT NOT NULL,
ADD COLUMN     "updateTxnHash" TEXT;

-- AlterTable
ALTER TABLE "ListingOffer" ADD COLUMN     "createTxnHash" TEXT NOT NULL,
ADD COLUMN     "updateTxnHash" TEXT;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "createTxnHash" TEXT NOT NULL,
ADD COLUMN     "updateTxnHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Auction_createTxnHash_key" ON "Auction"("createTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_updateTxnHash_key" ON "Auction"("updateTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionBid_createTxnHash_key" ON "AuctionBid"("createTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionBid_updateTxnHash_key" ON "AuctionBid"("updateTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "ListingOffer_createTxnHash_key" ON "ListingOffer"("createTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "ListingOffer_updateTxnHash_key" ON "ListingOffer"("updateTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_createTxnHash_key" ON "Offer"("createTxnHash");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_updateTxnHash_key" ON "Offer"("updateTxnHash");
