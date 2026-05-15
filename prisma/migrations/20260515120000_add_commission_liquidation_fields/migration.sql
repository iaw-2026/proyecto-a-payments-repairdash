-- AlterTable
ALTER TABLE "Transaction"
ADD COLUMN "reservedAt" TIMESTAMP(3),
ADD COLUMN "liquidatedAt" TIMESTAMP(3),
ADD COLUMN "commissionRate" DECIMAL(5,2),
ADD COLUMN "commissionAmount" DECIMAL(12,2),
ADD COLUMN "netAmount" DECIMAL(12,2);

-- CreateTable
CREATE TABLE "CommissionSettings" (
    "id" TEXT NOT NULL,
    "commissionRate" DECIMAL(5,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionSettings_pkey" PRIMARY KEY ("id")
);

-- Seed singleton settings
INSERT INTO "CommissionSettings" ("id", "commissionRate", "updatedAt")
VALUES ('platform', 10.00, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
