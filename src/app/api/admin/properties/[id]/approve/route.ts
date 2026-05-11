import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendSMS, SMS_TEMPLATES } from "@/lib/twilio";
import { logActivity } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const property = await prisma.property.update({
      where: { id: params.id },
      data: { status: "LIVE", listingStatus: "LIVE" },
      include: { postedBy: true },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    await prisma.listingFreshness.create({
      data: {
        propertyId: property.id,
        availabilityStatus: "AVAILABLE",
        confirmedById: session.id,
        note: "Verified by KrrishJazz ops",
        expiresAt,
      },
    });

    await logActivity({
      actorId: session.id,
      eventType: "PROPERTY_VERIFIED",
      targetType: "Property",
      targetId: property.id,
      metadata: { status: "LIVE", source: "ADMIN_APPROVAL" },
    });

    await sendSMS(property.postedBy.phone, SMS_TEMPLATES.propertyApproved(property.title));

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
  }
}
