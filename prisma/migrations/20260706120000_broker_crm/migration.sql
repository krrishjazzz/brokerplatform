-- Broker CRM: private clients, tasks, WhatsApp share history

CREATE TABLE "BrokerClient" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "altPhone" TEXT,
    "email" TEXT,
    "intent" TEXT NOT NULL DEFAULT 'BUY',
    "city" TEXT NOT NULL DEFAULT '',
    "localities" TEXT NOT NULL DEFAULT '[]',
    "propertyTypes" TEXT NOT NULL DEFAULT '[]',
    "budgetMin" DECIMAL(65,30),
    "budgetMax" DECIMAL(65,30),
    "bhk" INTEGER,
    "stage" TEXT NOT NULL DEFAULT 'NEW',
    "seriousness" TEXT NOT NULL DEFAULT 'WARM',
    "source" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "notes" TEXT NOT NULL DEFAULT '',
    "shortlistedIds" TEXT NOT NULL DEFAULT '[]',
    "nextFollowUpAt" TIMESTAMP(3),
    "lastContactAt" TIMESTAMP(3),
    "enquiryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrokerClient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BrokerTask" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "clientId" TEXT,
    "propertyId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "title" TEXT NOT NULL,
    "note" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrokerTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BrokerLeadShare" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "propertyId" TEXT,
    "propertyIds" TEXT NOT NULL DEFAULT '[]',
    "messageBody" TEXT NOT NULL,
    "templateKey" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrokerLeadShare_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BrokerClient_brokerId_phone_key" ON "BrokerClient"("brokerId", "phone");
CREATE INDEX "BrokerClient_brokerId_stage_idx" ON "BrokerClient"("brokerId", "stage");
CREATE INDEX "BrokerClient_brokerId_nextFollowUpAt_idx" ON "BrokerClient"("brokerId", "nextFollowUpAt");
CREATE INDEX "BrokerClient_brokerId_seriousness_idx" ON "BrokerClient"("brokerId", "seriousness");

CREATE INDEX "BrokerTask_brokerId_status_dueAt_idx" ON "BrokerTask"("brokerId", "status", "dueAt");
CREATE INDEX "BrokerTask_clientId_idx" ON "BrokerTask"("clientId");

CREATE INDEX "BrokerLeadShare_brokerId_clientId_idx" ON "BrokerLeadShare"("brokerId", "clientId");
CREATE INDEX "BrokerLeadShare_clientId_createdAt_idx" ON "BrokerLeadShare"("clientId", "createdAt");

ALTER TABLE "BrokerClient" ADD CONSTRAINT "BrokerClient_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BrokerTask" ADD CONSTRAINT "BrokerTask_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BrokerTask" ADD CONSTRAINT "BrokerTask_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "BrokerClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BrokerLeadShare" ADD CONSTRAINT "BrokerLeadShare_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BrokerLeadShare" ADD CONSTRAINT "BrokerLeadShare_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "BrokerClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BrokerLeadShare" ADD CONSTRAINT "BrokerLeadShare_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
