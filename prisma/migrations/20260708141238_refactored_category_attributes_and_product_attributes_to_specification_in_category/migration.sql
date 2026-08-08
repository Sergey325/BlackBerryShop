/*
  Warnings:

  - You are about to drop the `CategoryAttribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductAttributeValue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoryAttribute" DROP CONSTRAINT "CategoryAttribute_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProductAttributeValue" DROP CONSTRAINT "ProductAttributeValue_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "ProductAttributeValue" DROP CONSTRAINT "ProductAttributeValue_productId_fkey";

-- DropTable
DROP TABLE "CategoryAttribute";

-- DropTable
DROP TABLE "ProductAttributeValue";

-- CreateTable
CREATE TABLE "CategorySpecification" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "CategorySpecification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategorySpecification_categoryId_name_key" ON "CategorySpecification"("categoryId", "name");

-- AddForeignKey
ALTER TABLE "CategorySpecification" ADD CONSTRAINT "CategorySpecification_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
