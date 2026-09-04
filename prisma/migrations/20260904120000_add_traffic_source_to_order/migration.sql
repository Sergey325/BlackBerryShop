-- CreateEnum
CREATE TYPE "TrafficSource" AS ENUM ('FACEBOOK', 'GOOGLE_SEARCH', 'GOOGLE_FREE_LISTING', 'INSTAGRAM');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "trafficSource" "TrafficSource";
