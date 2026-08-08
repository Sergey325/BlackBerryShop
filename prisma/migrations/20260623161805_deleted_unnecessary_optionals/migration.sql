/*
  Warnings:

  - Made the column `area` on table `NovaPoshtaCity` required. This step will fail if there are existing NULL values in that column.
  - Made the column `warehouse` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `warehouseRef` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `warehouseNumber` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `color` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `size` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imageUrl` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "NovaPoshtaCity" ALTER COLUMN "area" SET NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "warehouse" SET NOT NULL,
ALTER COLUMN "warehouseRef" SET NOT NULL,
ALTER COLUMN "warehouseNumber" SET NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "size" SET NOT NULL,
ALTER COLUMN "imageUrl" SET NOT NULL;
