CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parentId" TEXT,
    "cityId" TEXT,
    "state" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT 'India',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "aliases" TEXT NOT NULL DEFAULT '[]',
    "nearbyIds" TEXT NOT NULL DEFAULT '[]',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Location_type_isActive_priority_idx" ON "Location"("type", "isActive", "priority");
CREATE INDEX "Location_cityId_type_isActive_idx" ON "Location"("cityId", "type", "isActive");
CREATE INDEX "Location_slug_isActive_idx" ON "Location"("slug", "isActive");

CREATE UNIQUE INDEX "Location_parentId_slug_key" ON "Location"("parentId", "slug");

ALTER TABLE "Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Location" ADD CONSTRAINT "Location_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
