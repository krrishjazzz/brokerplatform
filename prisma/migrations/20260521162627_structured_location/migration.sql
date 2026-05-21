-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "landmark" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "projectOrSociety" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "subLocality" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "LocationDictionary" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "subLocality" TEXT NOT NULL DEFAULT '',
    "aliases" TEXT NOT NULL DEFAULT '[]',
    "zone" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "nearbyLocalityIds" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationDictionary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocationDictionary_city_locality_isActive_idx" ON "LocationDictionary"("city", "locality", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LocationDictionary_city_locality_subLocality_key" ON "LocationDictionary"("city", "locality", "subLocality");
