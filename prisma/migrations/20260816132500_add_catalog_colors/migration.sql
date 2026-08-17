-- CreateTable
CREATE TABLE "CatalogColor" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,

    CONSTRAINT "CatalogColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductColorFilter" (
    "productColorId" INTEGER NOT NULL,
    "catalogColorId" INTEGER NOT NULL,

    CONSTRAINT "ProductColorFilter_pkey" PRIMARY KEY ("productColorId","catalogColorId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogColor_code_key" ON "CatalogColor"("code");

-- CreateIndex
CREATE INDEX "ProductColorFilter_catalogColorId_idx" ON "ProductColorFilter"("catalogColorId");

-- AddForeignKey
ALTER TABLE "ProductColorFilter" ADD CONSTRAINT "ProductColorFilter_productColorId_fkey" FOREIGN KEY ("productColorId") REFERENCES "ProductColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductColorFilter" ADD CONSTRAINT "ProductColorFilter_catalogColorId_fkey" FOREIGN KEY ("catalogColorId") REFERENCES "CatalogColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
