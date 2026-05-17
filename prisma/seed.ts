import { Prisma, PrismaClient, TransactionStatus, WithdrawalStatus } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or POSTGRES_PRISMA_URL is required");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  await prisma.commissionSettings.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.balance.deleteMany();
  await prisma.trabajador.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.user.deleteMany();

  const rider = await prisma.user.create({
    data: {
      clerkId: "user_rider_1",
      email: "rider@example.com",
      fullName: "Rider Demo",
      role: "rider",
      cliente: {
        create: {
        },
      },
    },
  });

  const driverOne = await prisma.user.create({
    data: {
      clerkId: "user_driver_1",
      email: "driver1@example.com",
      fullName: "Driver Uno",
      role: "driver",
      trabajador: {
        create: {
          cbuCvu: "0000003100000000000001",
          balance: {
            create: {
              balanceAvailable: new Prisma.Decimal("42000.00"),
              balanceLocked: new Prisma.Decimal("12000.00"),
            },
          },
        },
      },
    },
  });

  const driverTwo = await prisma.user.create({
    data: {
      clerkId: "user_driver_2",
      email: "driver2@example.com",
      fullName: "Driver Dos",
      role: "driver",
      trabajador: {
        create: {
          cbuCvu: "0000003100000000000002",
          balance: {
            create: {
              balanceAvailable: new Prisma.Decimal("18500.00"),
              balanceLocked: new Prisma.Decimal("0.00"),
            },
          },
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      clerkId: "user_admin_payments_1",
      email: "admin-payments@example.com",
      fullName: "Admin Payments Demo",
      role: "adminPayments",
    },
  });

  await prisma.commissionSettings.create({
    data: {
      id: "platform",
      commissionRate: new Prisma.Decimal("10.00"),
    },
  });

  const liquidatedAt = new Date();
  const reservedAt = new Date(liquidatedAt.getTime() - 60_000);

  await prisma.transaction.createMany({
    data: [
      {
        id: "txn_pending_1",
        trabajoId: "job_demo_pending_1",
        amount: new Prisma.Decimal("18000.00"),
        status: TransactionStatus.PENDING,
        clientId: rider.clerkId,
        trabajadorId: driverOne.clerkId,
        gatewayPaymentId: null,
      },
      {
        id: "txn_reserved_1",
        trabajoId: "job_demo_reserved_1",
        amount: new Prisma.Decimal("12000.00"),
        status: TransactionStatus.RESERVED,
        clientId: rider.clerkId,
        trabajadorId: driverOne.clerkId,
        gatewayPaymentId: "mp_demo_001",
        reservedAt,
      },
      {
        id: "txn_liquidated_1",
        trabajoId: "job_demo_liquidated_1",
        amount: new Prisma.Decimal("9500.00"),
        status: TransactionStatus.LIQUIDATED,
        clientId: rider.clerkId,
        trabajadorId: driverTwo.clerkId,
        gatewayPaymentId: "mp_demo_002",
        reservedAt,
        liquidatedAt,
        commissionRate: new Prisma.Decimal("10.00"),
        commissionAmount: new Prisma.Decimal("950.00"),
        netAmount: new Prisma.Decimal("8550.00"),
      },
    ],
  });

  await prisma.withdrawal.create({
    data: {
      id: "wd_demo_1",
      trabajadorId: driverOne.clerkId,
      amount: new Prisma.Decimal("5000.00"),
      status: WithdrawalStatus.REQUESTED,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
