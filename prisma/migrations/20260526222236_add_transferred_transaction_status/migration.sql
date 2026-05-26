-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'TRANSFERRED';

-- Backfill approved withdrawals so their ledger transaction stops appearing as pending.
UPDATE "Transaction" AS transaction
SET "status" = 'TRANSFERRED'
FROM "Withdrawal" AS withdrawal
WHERE transaction."trabajoId" = CONCAT('withdrawal:', withdrawal."id")
  AND transaction."status" = 'PENDING'
  AND withdrawal."status" = 'APPROVED';
