/*
  Warnings:

  - You are about to drop the `CategoryRelation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoryRelation" DROP CONSTRAINT "CategoryRelation_fromCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryRelation" DROP CONSTRAINT "CategoryRelation_toCategoryId_fkey";

-- DropTable
DROP TABLE "CategoryRelation";

-- CreateTable
CREATE TABLE "ProductRelation" (
    "id" SERIAL NOT NULL,
    "fromProductId" INTEGER NOT NULL,
    "toProductId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,

    CONSTRAINT "ProductRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductRelation_fromProductId_toProductId_key" ON "ProductRelation"("fromProductId", "toProductId");

-- AddForeignKey
ALTER TABLE "ProductRelation" ADD CONSTRAINT "ProductRelation_fromProductId_fkey" FOREIGN KEY ("fromProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRelation" ADD CONSTRAINT "ProductRelation_toProductId_fkey" FOREIGN KEY ("toProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
