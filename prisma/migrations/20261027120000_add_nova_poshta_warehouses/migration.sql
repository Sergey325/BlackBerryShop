CREATE TABLE "NovaPoshtaWarehouse" (
    "ref" UUID NOT NULL,
    "cityRef" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "typeRef" UUID NOT NULL,
    "available" BOOLEAN NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NovaPoshtaWarehouse_pkey" PRIMARY KEY ("ref")
);

CREATE INDEX "NovaPoshtaWarehouse_cityRef_number_idx"
    ON "NovaPoshtaWarehouse"("cityRef", "number");

CREATE TABLE "NovaPoshtaWarehouseSync" (
    "id" TEXT NOT NULL,
    "lockToken" UUID,
    "lockedUntil" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "total" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "NovaPoshtaWarehouseSync_pkey" PRIMARY KEY ("id")
);
