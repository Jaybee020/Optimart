/*
  Warnings:

  - You are about to drop the column `type` on the `ListingOffer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "type" "ListingType" NOT NULL DEFAULT 'REGULAR';

-- AlterTable
ALTER TABLE "ListingOffer" DROP COLUMN "type";
