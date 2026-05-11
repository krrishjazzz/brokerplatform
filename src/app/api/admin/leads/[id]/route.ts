import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/workflow";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = new Set(["NEW", "CONTACTED", "VISIT_SCHEDULED", "NEGOTIATING", "CLOSED", "LOST"]);

function parseMetadata(value: string) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const status = body.status ? String(body.status).toUpperCase() : "";
    const note = typeof body.note === "string" ? body.note.trim() : "";

    if (!status && !note) {
      return NextResponse.json({ error: "Status or note is required" }, { status: 400 });
    }

    if (status && !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid lead status" }, { status: 400 });
    }

    const existing = await prisma.enquiry.findUnique({
      where: { id: params.id },
      include: { property: { select: { id: true, title: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const lead = status
      ? await prisma.enquiry.update({
          where: { id: params.id },
          data: { status },
          include: {
            property: { select: { title: true, slug: true } },
            customer: { select: { name: true } },
          },
        })
      : await prisma.enquiry.findUniqueOrThrow({
          where: { id: params.id },
          include: {
            property: { select: { title: true, slug: true } },
            customer: { select: { name: true } },
          },
        });

    if (status) {
      await logActivity({
        actorId: session.id,
        eventType: "LEAD_STATUS_UPDATED",
        targetType: "ENQUIRY",
        targetId: lead.id,
        propertyId: existing.propertyId,
        metadata: {
          from: existing.status,
          to: status,
          note,
          propertyTitle: existing.property.title,
        },
      });
    } else if (note) {
      await logActivity({
        actorId: session.id,
        eventType: "LEAD_NOTE_ADDED",
        targetType: "ENQUIRY",
        targetId: lead.id,
        propertyId: existing.propertyId,
        metadata: {
          note,
          status: existing.status,
          propertyTitle: existing.property.title,
        },
      });
    }

    const activities = await prisma.activityEvent.findMany({
      where: {
        targetType: "ENQUIRY",
        targetId: lead.id,
        eventType: { in: ["LEAD_NOTE_ADDED", "LEAD_STATUS_UPDATED"] },
      },
      include: { actor: { select: { name: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });

    const notes = activities.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      createdAt: event.createdAt.toISOString(),
      actorName: event.actor?.name || event.actor?.phone || "KrrishJazz Ops",
      metadata: parseMetadata(event.metadata),
    }));
    const latestNote = notes.find((event) => event.metadata?.note);

    return NextResponse.json({
      lead: {
        ...lead,
        notes,
        latestNote: latestNote?.metadata?.note || "",
        latestNoteActorName: latestNote?.actorName || "",
      },
    });
  } catch (error) {
    console.error("Admin lead update error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
