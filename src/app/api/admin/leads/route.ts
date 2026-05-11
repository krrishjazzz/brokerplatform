import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function parseMetadata(value: string) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const leads = await prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { title: true, slug: true } },
        customer: { select: { name: true } },
      },
    });

    const activities = leads.length
      ? await prisma.activityEvent.findMany({
          where: {
            targetType: "ENQUIRY",
            targetId: { in: leads.map((lead) => lead.id) },
            eventType: { in: ["LEAD_NOTE_ADDED", "LEAD_STATUS_UPDATED", "LEAD_FOLLOW_UP_UPDATED"] },
          },
          include: { actor: { select: { name: true, phone: true } } },
          orderBy: { createdAt: "desc" },
        })
      : [];

    const activityByLead = activities.reduce<Record<string, any[]>>((acc, event) => {
      acc[event.targetId] = acc[event.targetId] || [];
      acc[event.targetId].push({
        id: event.id,
        eventType: event.eventType,
        createdAt: event.createdAt.toISOString(),
        actorName: event.actor?.name || event.actor?.phone || "KrrishJazz Ops",
        metadata: parseMetadata(event.metadata),
      });
      return acc;
    }, {});

    return NextResponse.json({
      leads: leads.map((lead) => {
        const notes = activityByLead[lead.id] || [];
        const latestNote = notes.find((event) => event.metadata?.note);

        return {
          ...lead,
          notes,
          latestNote: latestNote?.metadata?.note || "",
          latestNoteActorName: latestNote?.actorName || "",
        };
      }),
    });
  } catch (error) {
    console.error("Admin leads error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
