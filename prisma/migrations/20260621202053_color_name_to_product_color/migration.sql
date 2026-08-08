/*
  Warnings:

  - Added the required column `colorName` to the `ProductColor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductColor" ADD COLUMN     "colorName" TEXT NOT NULL;
