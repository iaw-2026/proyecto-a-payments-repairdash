-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'RESERVED', 'LIQUIDATED', 'DISPUTED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("clerkId")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "clerkId" TEXT NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("clerkId")
);

-- CreateTable
CREATE TABLE "Trabajador" (
    "clerkId" TEXT NOT NULL,
    "cbuCvu" TEXT NOT NULL,

    CONSTRAINT "Trabajador_pkey" PRIMARY KEY ("clerkId")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "clientId" TEXT NOT NULL,
    "trabajadorId" TEXT NOT NULL,
    "gatewayPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance" (
    "trabajadorId" TEXT NOT NULL,
    "balanceAvailable" DECIMAL(12,2) NOT NULL,
    "balanceLocked" DECIMAL(12,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("trabajadorId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajador" ADD CONSTRAINT "Trabajador_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;
