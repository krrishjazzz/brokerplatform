/**
 * Run: npm run db:test
 * Verifies DIRECT_URL / DATABASE_URL can reach Supabase/Postgres from the shell.
 */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function ensureSslMode(url) {
  if (!url || /sslmode=/.test(url)) return url;
  if (!/supabase\.com|pooler\.supabase/.test(url)) return url;
  const joiner = url.includes("?") ? "&" : "?";
  return `${url}${joiner}sslmode=require`;
}

function maskUrl(url) {
  return url.replace(/:[^:@]+@/, ":****@");
}

async function main() {
  const root = path.join(__dirname, "..");
  loadEnvFile(path.join(root, ".env"));
  loadEnvFile(path.join(root, ".env.local"));

  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
  if (!rawUrl) {
    console.error("FAILED — Set DIRECT_URL or DATABASE_URL in .env");
    process.exit(1);
  }

  const url = ensureSslMode(rawUrl);
  const host = maskUrl(url).split("@")[1]?.split("/")[0] || "(missing)";
  console.log("Testing:", host);
  console.log("Using:", process.env.DIRECT_URL ? "DIRECT_URL" : "DATABASE_URL");

  const prisma = new PrismaClient({
    datasources: { db: { url } },
  });

  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    console.log("OK — database connected.");
  } catch (error) {
    console.error("FAILED —", error.message);
    if (/credential|TLS|certificate|SSL/i.test(String(error.message))) {
      console.error(
        "Tip: Use Supabase Connect → Session pooler (5432) for DIRECT_URL, add ?sslmode=require, and match project region/password."
      );
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
