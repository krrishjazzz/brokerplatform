-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "typeSpecificDetails" TEXT NOT NULL DEFAULT '{}',
ALTER COLUMN "amenities" SET DEFAULT '[]';
