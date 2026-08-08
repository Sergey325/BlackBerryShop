-- CreateTable
CREATE TABLE "Banner" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "features" TEXT[],
    "ctaHref" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);
