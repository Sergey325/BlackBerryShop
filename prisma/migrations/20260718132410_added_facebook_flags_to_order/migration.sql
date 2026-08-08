-- DropIndex
DROP INDEX "product_name_trgm_idx";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "clientIp" TEXT,
ADD COLUMN     "fbc" TEXT,
ADD COLUMN     "fbp" TEXT,
ADD COLUMN     "userAgent" TEXT;
