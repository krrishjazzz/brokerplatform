import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity, upsertCollaboration } from "@/lib/workflow";

export const dynamic = "force-dynamic";

const allowedEvents = new Set([
  "PROPERTY_SHARED",
  "DEMAND_SHARED",
  "BROKER_CALL_CLICKED",
  "BROKER_WHATSAPP_CLICKED",
  "COLLABORATION_STATUS_CHANGED",
  "MATCH_ACTION_CLICKED",
]);

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "BROKER" || session.brokerStatus !== "APPROVED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      propertyId,
      requirementId,
      eventType = "MATCH_ACTION_CLICKED",
      status = "SHARED",
      source = "MATCH_DRAWER",
      recipientId,
      metadata = {},
    } = body;

    if (!allowedEvents.has(eventType)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    if (!propertyId && !requirementId) {
      return NextResponse.json({ error: "propertyId or requirementId is required" }, { status: 400 });
    }

    let resolvedRecipientId = recipientId || null;

    if (!resolvedRecipientId && requirementId) {
      const requirement = await prisma.requirement.findUnique({
        where: { id: requirementId },
        select: { brokerId: true },
      });
      resolvedRecipientId = requirement?.brokerId || null;
    }

    if (!resolvedRecipientId && propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { assignedBrokerId: true, postedById: true },
      });
      resolvedRecipientId = property?.assignedBrokerId || property?.postedById || null;
    }

    await prisma.brokerProfile.updateMany({
      where: { profileId: session.id },
      data: { lastActiveAt: new Date() },
    });

    if (propertyId && requirementId) {
      const collaboration = await upsertCollaboration({
        propertyId,
        requirementId,
        initiatorId: session.id,
        recipientId: resolvedRecipientId,
        status,
        source,
        lastAction: eventType,
        metadata,
      });
      return NextResponse.json({ collaboration });
    }

    const event = await logActivity({
      actorId: session.id,
      eventType,
      targetType: propertyId ? "PROPERTY" : "REQUIREMENT",
      targetId: propertyId || requirementId,
      propertyId,
      requirementId,
      metadata,
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Broker collaboration event error:", error);
    return NextResponse.json({ error: "Failed to track collaboration" }, { status: 500 });
  }
}
