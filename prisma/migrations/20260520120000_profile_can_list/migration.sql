-- Add listing capability separate from role
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "canList" BOOLEAN NOT NULL DEFAULT false;

-- Backfill existing owners/brokers/admins
UPDATE "Profile" SET "canList" = true WHERE "role" IN ('OWNER', 'BROKER', 'ADMIN');
