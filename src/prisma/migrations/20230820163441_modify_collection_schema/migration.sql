-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "profileUrl" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileUrl" TEXT;
