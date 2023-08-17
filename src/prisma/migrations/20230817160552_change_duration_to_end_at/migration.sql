/*
  Warnings:

  - You are about to drop the column `duration` on the `Auction` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `ListingOffer` table. All the data in the column will be lost.
  - Added the required column `endAt` to the `Auction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Auction" DROP COLUMN "duration",
ADD COLUMN     "endAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "duration",
ADD COLUMN     "endAt" TIMESTAMP(3),
ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ListingOffer" DROP COLUMN "duration",
ADD COLUMN     "endAt" TIMESTAMP(3);
