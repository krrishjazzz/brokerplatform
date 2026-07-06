import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient();
}

/** Recreate client in dev when schema changes (e.g. after prisma generate). */
function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  if (cached && typeof (cached as PrismaClient & { brokerClient?: unknown }).brokerClient !== "undefined") {
    return cached;
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
