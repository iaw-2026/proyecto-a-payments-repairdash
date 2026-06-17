import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createAdapter() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL or POSTGRES_PRISMA_URL is required");
  }

  return new PrismaPg({ connectionString });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter: createAdapter() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
