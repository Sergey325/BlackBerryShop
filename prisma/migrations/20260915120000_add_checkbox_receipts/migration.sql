ALTER TABLE "Order"
ADD COLUMN "checkboxReceiptId" TEXT,
ADD COLUMN "checkboxReceiptFiscalCode" TEXT,
ADD COLUMN "checkboxReceiptStatus" TEXT,
ADD COLUMN "checkboxReceiptCreatedAt" TIMESTAMP(3),
ADD COLUMN "checkboxPrepaymentRelationId" TEXT,
ADD COLUMN "checkboxAfterpaymentReceiptId" TEXT,
ADD COLUMN "checkboxAfterpaymentFiscalCode" TEXT,
ADD COLUMN "checkboxAfterpaymentStatus" TEXT,
ADD COLUMN "checkboxAfterpaymentCreatedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Order_checkboxReceiptId_key" ON "Order"("checkboxReceiptId");
CREATE UNIQUE INDEX "Order_checkboxPrepaymentRelationId_key" ON "Order"("checkboxPrepaymentRelationId");
CREATE UNIQUE INDEX "Order_checkboxAfterpaymentReceiptId_key" ON "Order"("checkboxAfterpaymentReceiptId");
