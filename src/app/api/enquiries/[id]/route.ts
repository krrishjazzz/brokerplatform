import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enquiry = await prisma.enquiry.findUnique({
      where: { id: params.id },
      include: { property: { select: { postedById: true, title: true } } },
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    if (enquiry.property.postedById !== session.id && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const action = body.ownerAction as string | undefined;

    if (action === "confirm_availability") {
      const updated = await prisma.enquiry.update({
        where: { id: enquiry.id },
        data: {
          status: enquiry.status === "NEW" || enquiry.status === "CONTACTED" ? "VISIT_SCHEDULED" : enquiry.status,
        },
      });

      await logActivity({
        actorId: session.id,
        eventType: "ENQUIRY_OWNER_CONFIRMED",
        targetType: "ENQUIRY",
        targetId: enquiry.id,
        propertyId: enquiry.propertyId,
        metadata: { action: "confirm_availability" },
      });

      return NextResponse.json({ enquiry: updated });
    }

    if (action === "request_reschedule") {
      const updated = await prisma.enquiry.update({
        where: { id: enquiry.id },
        data: {
          status: "VISIT_SCHEDULED",
          visitDate: null,
        },
      });

      await logActivity({
        actorId: session.id,
        eventType: "ENQUIRY_OWNER_RESCHEDULE",
        targetType: "ENQUIRY",
        targetId: enquiry.id,
        propertyId: enquiry.propertyId,
        metadata: { action: "request_reschedule" },
      });

      return NextResponse.json({ enquiry: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Enquiry update error:", error);
    return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
  }
}
