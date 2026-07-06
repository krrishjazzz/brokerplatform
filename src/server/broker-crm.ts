import type { BrokerClient, BrokerLeadShare, BrokerTask, Property } from "@prisma/client";

export const CRM_STAGES = ["NEW", "CONTACTED", "VISIT_SCHEDULED", "NEGOTIATION", "WON", "LOST"] as const;
export const CRM_SERIOUSNESS = ["HOT", "WARM", "COLD"] as const;
export const CRM_INTENTS = ["BUY", "RENT", "LEASE", "SELL"] as const;
export const CRM_SOURCES = ["CALL", "WHATSAPP", "REFERRAL", "WALK_IN", "KRRISHJAZZ"] as const;
export const CRM_TASK_TYPES = ["CALL", "WHATSAPP", "VISIT", "REMIND"] as const;

export type CrmStage = (typeof CRM_STAGES)[number];

export function normalizeClientPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (input.startsWith("+")) return input;
  return input.trim();
}

export function parseJsonArray(value: string | null | undefined) {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function formatBrokerClient(client: BrokerClient) {
  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    altPhone: client.altPhone,
    email: client.email,
    intent: client.intent,
    city: client.city,
    localities: parseJsonArray(client.localities),
    propertyTypes: parseJsonArray(client.propertyTypes),
    budgetMin: client.budgetMin ? Number(client.budgetMin) : null,
    budgetMax: client.budgetMax ? Number(client.budgetMax) : null,
    bhk: client.bhk,
    stage: client.stage,
    seriousness: client.seriousness,
    source: client.source,
    notes: client.notes,
    shortlistedIds: parseJsonArray(client.shortlistedIds),
    nextFollowUpAt: client.nextFollowUpAt?.toISOString() || null,
    lastContactAt: client.lastContactAt?.toISOString() || null,
    enquiryId: client.enquiryId,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  };
}

export function formatBrokerTask(task: BrokerTask & { client?: { id: string; name: string; phone: string } | null }) {
  return {
    id: task.id,
    clientId: task.clientId,
    propertyId: task.propertyId,
    type: task.type,
    title: task.title,
    note: task.note,
    dueAt: task.dueAt.toISOString(),
    status: task.status,
    client: task.client
      ? { id: task.client.id, name: task.client.name, phone: task.client.phone }
      : null,
    createdAt: task.createdAt.toISOString(),
  };
}

export function formatBrokerShare(share: BrokerLeadShare) {
  return {
    id: share.id,
    clientId: share.clientId,
    propertyId: share.propertyId,
    propertyIds: parseJsonArray(share.propertyIds),
    messageBody: share.messageBody,
    templateKey: share.templateKey,
    channel: share.channel,
    createdAt: share.createdAt.toISOString(),
  };
}

export function formatCrmListing(property: Property) {
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    city: property.city,
    locality: property.locality,
    propertyType: property.propertyType,
    listingType: property.listingType,
    price: Number(property.price),
    area: property.area,
    areaUnit: property.areaUnit,
    coverImage: property.coverImage,
    listingStatus: property.listingStatus,
    status: property.status,
    enquiryCount: property.enquiryCount,
    viewCount: property.viewCount,
    updatedAt: property.updatedAt.toISOString(),
  };
}

export function stageLabel(stage: string) {
  const labels: Record<string, string> = {
    NEW: "New",
    CONTACTED: "Contacted",
    VISIT_SCHEDULED: "Visit",
    NEGOTIATION: "Negotiation",
    WON: "Won",
    LOST: "Lost",
  };
  return labels[stage] || stage;
}
