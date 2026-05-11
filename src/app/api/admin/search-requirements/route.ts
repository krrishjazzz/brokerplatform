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

    const events = await prisma.activityEvent.findMany({
      where: {
        eventType: "SEARCH_REQUIREMENT_CAPTURED",
        targetType: "SEARCH_REQUIREMENT",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      requirements: events.map((event) => ({
        id: event.targetId,
        activityId: event.id,
        createdAt: event.createdAt.toISOString(),
        ...parseMetadata(event.metadata),
      })),
    });
  } catch (error) {
    console.error("Admin search requirements error:", error);
    return NextResponse.json({ error: "Failed to fetch search requirements" }, { status: 500 });
  }
}
