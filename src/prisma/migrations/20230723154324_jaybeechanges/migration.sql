-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "status" "OfferStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "AuctionBid" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "dateCreated" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "status" SET DEFAULT 'ONGOING';

-- AlterTable
ALTER TABLE "ListingOffer" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Nft" ALTER COLUMN "uri" DROP NOT NULL,
ALTER COLUMN "imageUrl" DROP NOT NULL,
ALTER COLUMN "attributes" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Offer" ALTER COLUMN "status" SET DEFAULT 'PENDING';
