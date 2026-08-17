-- AlterTable
ALTER TABLE "ProductColor" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "ProductColor_productId_position_idx" ON "ProductColor"("productId", "position");
