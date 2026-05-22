ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "ownerStatus" TEXT NOT NULL DEFAULT 'NONE';
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "permissionsVersion" INTEGER NOT NULL DEFAULT 0;

UPDATE "Profile" SET "ownerStatus" = 'APPROVED' WHERE "canList" = true AND "role" IN ('OWNER', 'BROKER', 'ADMIN');
UPDATE "Profile" SET "ownerStatus" = 'APPROVED' WHERE "role" = 'ADMIN';
