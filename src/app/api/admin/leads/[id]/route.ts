import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/workflow";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = new Set(["NEW", "CONTACTED", "VISIT_SCHEDULED", "NEGOTIATING", "CLOSED", "LOST"]);
const ALLOWED_PRIORITIES = new Set(["LOW", "NORMAL", "HIGH", "URGENT"]);

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
    const priority = body.priority ? String(body.priority).toUpperCase() : "";
    const nextAction = typeof body.nextAction === "string" ? body.nextAction.trim() : undefined;
    const assignedTo = typeof body.assignedTo === "string" ? body.assignedTo.trim() : undefined;
    const lastOutcome = typeof body.lastOutcome === "string" ? body.lastOutcome.trim() : undefined;
    const followUpAt = body.followUpAt ? new Date(body.followUpAt) : undefined;

    if (!status && !note && !priority && nextAction === undefined && assignedTo === undefined && lastOutcome === undefined && !followUpAt) {
      return NextResponse.json({ error: "Status, note, or follow-up update is required" }, { status: 400 });
    }

    if (status && !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid lead status" }, { status: 400 });
    }
    if (priority && !ALLOWED_PRIORITIES.has(priority)) {
      return NextResponse.json({ error: "Invalid lead priority" }, { status: 400 });
    }
    if (followUpAt && Number.isNaN(followUpAt.getTime())) {
      return NextResponse.json({ error: "Invalid follow-up date" }, { status: 400 });
    }

    const existing = await prisma.enquiry.findUnique({
      where: { id: params.id },
      include: { property: { select: { id: true, title: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (nextAction !== undefined) updateData.nextAction = nextAction || null;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
    if (lastOutcome !== undefined) updateData.lastOutcome = lastOutcome || null;
    if (followUpAt) updateData.followUpAt = followUpAt;

    const lead = Object.keys(updateData).length
      ? await prisma.enquiry.update({
          where: { id: params.id },
          data: updateData,
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

    if (priority || nextAction !== undefined || assignedTo !== undefined || lastOutcome !== undefined || followUpAt) {
      await logActivity({
        actorId: session.id,
        eventType: "LEAD_FOLLOW_UP_UPDATED",
        targetType: "ENQUIRY",
        targetId: lead.id,
        propertyId: existing.propertyId,
        metadata: {
          priority: priority || lead.priority,
          nextAction: nextAction ?? lead.nextAction,
          assignedTo: assignedTo ?? lead.assignedTo,
          lastOutcome: lastOutcome ?? lead.lastOutcome,
          followUpAt: followUpAt ? followUpAt.toISOString() : lead.followUpAt?.toISOString(),
          note,
          propertyTitle: existing.property.title,
        },
      });
    }

    const activities = await prisma.activityEvent.findMany({
      where: {
        targetType: "ENQUIRY",
        targetId: lead.id,
        eventType: { in: ["LEAD_NOTE_ADDED", "LEAD_STATUS_UPDATED", "LEAD_FOLLOW_UP_UPDATED"] },
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
