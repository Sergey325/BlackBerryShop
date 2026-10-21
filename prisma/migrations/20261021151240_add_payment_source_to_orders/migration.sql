

BEGIN;

DO $$
BEGIN
    IF to_regtype('public."PaymentSource"') IS NULL THEN
CREATE TYPE "public"."PaymentSource"
    AS ENUM ('MONOBANK', 'CURRENT_ACCOUNT');
END IF;
END
$$;

ALTER TABLE "public"."Order"
    ADD COLUMN IF NOT EXISTS "paymentSource" "public"."PaymentSource";

UPDATE "public"."Order"
SET "paymentSource" = CASE
                          WHEN "isWholesale" = true
                              THEN 'CURRENT_ACCOUNT'::"public"."PaymentSource"
                          ELSE 'MONOBANK'::"public"."PaymentSource"
    END
WHERE "paymentSource" IS NULL;

ALTER TABLE "public"."Order"
    ALTER COLUMN "paymentSource" SET NOT NULL;

COMMIT;
