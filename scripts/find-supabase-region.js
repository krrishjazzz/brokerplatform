const { Client } = require("pg");

const password = process.env.SUPABASE_DB_PASSWORD || "krrishjazz2026";
const ref = "cdimaijpnpfxccendzuu";
const regions = ["ap-south-1", "us-east-1", "eu-west-1", "ap-southeast-1", "eu-central-1"];

async function tryUrl(label, connectionString) {
  const client = new Client({ connectionString, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    await client.query("SELECT 1");
    console.log("OK:", label);
    return true;
  } catch (error) {
    console.log("FAIL:", label, "-", error.message.split("\n")[0]);
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

async function main() {
  let found = false;
  for (const region of regions) {
    const pooler = `postgresql://postgres.${ref}:${password}@aws-0-${region}.pooler.supabase.com:5432/postgres?sslmode=require`;
    if (await tryUrl(`pooler ${region}`, pooler)) {
      console.log("\nUse in .env:\nDATABASE_URL=" + pooler + "\nDIRECT_URL=" + pooler);
      found = true;
      break;
    }
  }
  if (!found) {
    const direct = `postgresql://postgres:${password}@db.${ref}.supabase.co:5432/postgres?sslmode=require`;
    if (await tryUrl("direct db host", direct)) {
      console.log("\nUse in .env:\nDATABASE_URL=" + direct + "\nDIRECT_URL=" + direct);
      found = true;
    }
  }
  process.exit(found ? 0 : 1);
}

main();
