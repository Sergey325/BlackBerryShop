-- CreateTable
CREATE TABLE "ProductSpecificationOverride" (
    "productId" INTEGER NOT NULL,
    "categorySpecificationId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ProductSpecificationOverride_pkey" PRIMARY KEY ("productId","categorySpecificationId")
);

-- CreateIndex
CREATE INDEX "ProductSpecificationOverride_categorySpecificationId_idx" ON "ProductSpecificationOverride"("categorySpecificationId");

-- AddForeignKey
ALTER TABLE "ProductSpecificationOverride" ADD CONSTRAINT "ProductSpecificationOverride_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecificationOverride" ADD CONSTRAINT "ProductSpecificationOverride_categorySpecificationId_fkey" FOREIGN KEY ("categorySpecificationId") REFERENCES "CategorySpecification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
