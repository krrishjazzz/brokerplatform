import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/workflow";

export const dynamic = "force-dynamic";

const allowedStatuses = ["AVAILABLE", "ON_HOLD", "CLOSED"] as const;

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;
    const { listingStatus, note } = await req.json();

    if (!allowedStatuses.includes(listingStatus)) {
      return NextResponse.json({ error: "Invalid listing status" }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { slug },
      select: {
        id: true,
        postedById: true,
        assignedBrokerId: true,
        status: true,
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const canUpdate =
      session.role === "ADMIN" ||
      session.id === property.postedById ||
      session.id === property.assignedBrokerId;

    if (!canUpdate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.property.update({
      where: { slug },
      data: {
        listingStatus,
        status: listingStatus === "CLOSED" ? "CLOSED" : property.status,
      },
      select: {
        id: true,
        slug: true,
        listingStatus: true,
        status: true,
        updatedAt: true,
      },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    await prisma.listingFreshness.create({
      data: {
        propertyId: property.id,
        confirmedById: session.id,
        availabilityStatus: listingStatus,
        expiresAt,
        note: note || "Availability refreshed",
      },
    });

    await logActivity({
      actorId: session.id,
      eventType: "LISTING_FRESHNESS_UPDATED",
      targetType: "PROPERTY",
      targetId: property.id,
      propertyId: property.id,
      metadata: { listingStatus, note: note || null },
    });

    return NextResponse.json({ property: updated });
  } catch (error) {
    console.error("Property freshness update error:", error);
    return NextResponse.json({ error: "Failed to update listing freshness" }, { status: 500 });
  }
}
