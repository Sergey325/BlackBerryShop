-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "ttnStatus" TEXT,
ADD COLUMN     "ttnStatusCode" TEXT,
ADD COLUMN     "ttnStatusUpdatedAt" TIMESTAMP(3);
