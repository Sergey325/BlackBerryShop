-- Restore the column after the accidental rollback migration was applied.
ALTER TABLE "Category" ADD COLUMN "defaultSizes" TEXT[] DEFAULT ARRAY[]::TEXT[];
