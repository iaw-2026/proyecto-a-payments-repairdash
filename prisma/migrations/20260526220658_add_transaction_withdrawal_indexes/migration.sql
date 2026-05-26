-- CreateIndex
CREATE INDEX "idx_transaction_client_created_at" ON "Transaction"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_transaction_client_status_created_at" ON "Transaction"("clientId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "idx_transaction_trabajador_created_at" ON "Transaction"("trabajadorId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_transaction_trabajador_status_liquidated_created_at" ON "Transaction"("trabajadorId", "status", "liquidatedAt", "createdAt");

-- CreateIndex
CREATE INDEX "idx_transaction_status_created_at" ON "Transaction"("status", "createdAt");

-- CreateIndex
CREATE INDEX "idx_transaction_created_at" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "idx_withdrawal_trabajador_created_at" ON "Withdrawal"("trabajadorId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_withdrawal_status_created_at" ON "Withdrawal"("status", "createdAt");

-- CreateIndex
CREATE INDEX "idx_withdrawal_created_at" ON "Withdrawal"("createdAt");
