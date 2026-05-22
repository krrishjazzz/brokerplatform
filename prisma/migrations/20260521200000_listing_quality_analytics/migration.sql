ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "listingQualityScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "listingQualityBreakdown" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "searchImpressionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "clickCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "enquiryCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "visitCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "PropertyMetricDaily" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "searchImpressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "enquiries" INTEGER NOT NULL DEFAULT 0,
    "visits" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PropertyMetricDaily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PropertyMetricDaily_propertyId_day_key" ON "PropertyMetricDaily"("propertyId", "day");
CREATE INDEX IF NOT EXISTS "PropertyMetricDaily_propertyId_idx" ON "PropertyMetricDaily"("propertyId");

DO $$ BEGIN
  ALTER TABLE "PropertyMetricDaily" ADD CONSTRAINT "PropertyMetricDaily_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
