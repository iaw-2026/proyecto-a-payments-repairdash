ALTER TYPE "TransactionStatus" ADD VALUE 'FAILED';

ALTER TABLE "Transaction"
ADD COLUMN "trabajoId" TEXT,
ADD COLUMN "gatewayPreferenceId" TEXT,
ADD COLUMN "gatewayCheckoutUrl" TEXT;

UPDATE "Transaction"
SET "trabajoId" = 'legacy:' || "id"
WHERE "trabajoId" IS NULL;

ALTER TABLE "Transaction"
ALTER COLUMN "trabajoId" SET NOT NULL;

CREATE UNIQUE INDEX "Transaction_trabajoId_key" ON "Transaction"("trabajoId");
