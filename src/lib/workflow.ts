import { prisma } from "@/lib/prisma";

type ActivityInput = {
  actorId?: string | null;
  eventType: string;
  targetType: string;
  targetId: string;
  propertyId?: string | null;
  requirementId?: string | null;
  collaborationId?: string | null;
  metadata?: Record<string, unknown>;
};

type CollaborationInput = {
  propertyId?: string | null;
  requirementId?: string | null;
  initiatorId: string;
  recipientId?: string | null;
  status?: string;
  source?: string;
  lastAction: string;
  metadata?: Record<string, unknown>;
};

export async function logActivity(input: ActivityInput) {
  try {
    return await prisma.activityEvent.create({
      data: {
        actorId: input.actorId || null,
        eventType: input.eventType,
        targetType: input.targetType,
        targetId: input.targetId,
        propertyId: input.propertyId || null,
        requirementId: input.requirementId || null,
        collaborationId: input.collaborationId || null,
        metadata: JSON.stringify(input.metadata || {}),
      },
    });
  } catch (error) {
    console.error("Activity logging failed:", error);
    return null;
  }
}

export async function upsertCollaboration(input: CollaborationInput) {
  const existing = input.propertyId && input.requirementId
    ? await prisma.collaboration.findFirst({
        where: {
          propertyId: input.propertyId,
          requirementId: input.requirementId,
          initiatorId: input.initiatorId,
        },
      })
    : null;

  const collaboration = existing
    ? await prisma.collaboration.update({
        where: { id: existing.id },
        data: {
          recipientId: input.recipientId || existing.recipientId,
          status: input.status || existing.status,
          source: input.source || existing.source,
          lastAction: input.lastAction,
        },
      })
    : await prisma.collaboration.create({
        data: {
          propertyId: input.propertyId || null,
          requirementId: input.requirementId || null,
          initiatorId: input.initiatorId,
          recipientId: input.recipientId || null,
          status: input.status || "SHARED",
          source: input.source || "MATCH_DRAWER",
          lastAction: input.lastAction,
        },
      });

  await logActivity({
    actorId: input.initiatorId,
    eventType: input.lastAction,
    targetType: "COLLABORATION",
    targetId: collaboration.id,
    propertyId: input.propertyId,
    requirementId: input.requirementId,
    collaborationId: collaboration.id,
    metadata: input.metadata,
  });

  return collaboration;
}

export function scoreMatch(input: {
  propertyCity: string;
  propertyLocality?: string | null;
  propertyType: string;
  price: number;
  requirementCity: string;
  requirementLocality?: string | null;
  requirementType: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
}) {
  const reasons: string[] = [];
  let score = 0;

  const cityMatch =
    input.propertyCity.toLowerCase().includes(input.requirementCity.toLowerCase()) ||
    input.requirementCity.toLowerCase().includes(input.propertyCity.toLowerCase());
  const localityMatch = Boolean(
    input.propertyLocality &&
      input.requirementLocality &&
      (input.propertyLocality.toLowerCase().includes(input.requirementLocality.toLowerCase()) ||
        input.requirementLocality.toLowerCase().includes(input.propertyLocality.toLowerCase()))
  );
  const typeMatch = input.propertyType === input.requirementType;
  const budgetMatch =
    (!input.budgetMin || input.price >= input.budgetMin) &&
    (!input.budgetMax || input.price <= input.budgetMax);

  if (cityMatch) {
    score += 25;
    reasons.push("same city");
  }
  if (localityMatch) {
    score += 20;
    reasons.push("locality fit");
  }
  if (typeMatch) {
    score += 30;
    reasons.push("property type fit");
  }
  if (budgetMatch) {
    score += 25;
    reasons.push("budget fit");
  }

  return {
    score,
    label: score >= 85 ? "Strong fit" : score >= 60 ? "Good fit" : "Review fit",
    variant: score >= 85 ? "success" : score >= 60 ? "accent" : "warning",
    reasons,
  };
}
