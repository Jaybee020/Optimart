/*
  Warnings:

  - Added the required column `sellOfferId` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyOfferId` to the `ListingOffer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "sellOfferId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ListingOffer" ADD COLUMN     "buyOfferId" TEXT NOT NULL;
