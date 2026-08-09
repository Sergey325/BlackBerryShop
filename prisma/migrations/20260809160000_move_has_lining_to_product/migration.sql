-- Add the product-level flag and preserve the existing category-level values.
ALTER TABLE "Product"
ADD COLUMN "hasLining" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Product" AS product
SET "hasLining" = COALESCE(category."hasLining", false)
FROM "Category" AS category
WHERE product."categoryId" = category.id;

ALTER TABLE "Category"
DROP COLUMN "hasLining";
