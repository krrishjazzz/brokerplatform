/**
 * Run: node scripts/test-db-connection.js
 * Verifies DATABASE_URL can reach Supabase/Postgres.
 */
const { PrismaClient } = require("@prisma/client");

async function main() {
  const url = process.env.DATABASE_URL || "";
  const host = url.replace(/:[^:@]+@/, ":****@").split("@")[1]?.split("/")[0] || "(missing)";
  console.log("Testing:", host);

  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    console.log("OK — database connected.");
  } catch (error) {
    console.error("FAILED —", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
