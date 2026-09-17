ALTER TABLE "Order"
ADD COLUMN "publicToken" TEXT,
ADD COLUMN "checkboxReceiptUrl" TEXT;

UPDATE "Order"
SET "publicToken" = gen_random_uuid()::TEXT
WHERE "publicToken" IS NULL;

ALTER TABLE "Order"
ALTER COLUMN "publicToken" SET NOT NULL;

CREATE UNIQUE INDEX "Order_publicToken_key" ON "Order"("publicToken");
