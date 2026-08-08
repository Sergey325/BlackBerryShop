-- CreateEnum
CREATE TYPE "PromoScopeType" AS ENUM ('ALL', 'CATEGORY', 'PRODUCT');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discountAmount" DOUBLE PRECISION,
ADD COLUMN     "discountPercentApplied" DOUBLE PRECISION,
ADD COLUMN     "promoCodeId" INTEGER,
ADD COLUMN     "promoCodeSnapshot" TEXT;

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL,
    "scopeType" "PromoScopeType" NOT NULL DEFAULT 'ALL',
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCodeCategory" (
    "id" SERIAL NOT NULL,
    "promoCodeId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "PromoCodeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCodeProduct" (
    "id" SERIAL NOT NULL,
    "promoCodeId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "PromoCodeProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCodeCategory_promoCodeId_categoryId_key" ON "PromoCodeCategory"("promoCodeId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCodeProduct_promoCodeId_productId_key" ON "PromoCodeProduct"("promoCodeId", "productId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeCategory" ADD CONSTRAINT "PromoCodeCategory_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeCategory" ADD CONSTRAINT "PromoCodeCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeProduct" ADD CONSTRAINT "PromoCodeProduct_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeProduct" ADD CONSTRAINT "PromoCodeProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
