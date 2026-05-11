import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId } = await req.json();
    if (!propertyId) {
      return NextResponse.json({ error: "Property ID required" }, { status: 400 });
    }

    const existing = await prisma.savedProperty.findUnique({
      where: { userId_propertyId: { userId: session.id, propertyId } },
    });

    if (existing) {
      await prisma.savedProperty.delete({ where: { id: existing.id } });
      await logActivity({
        actorId: session.id,
        eventType: "PROPERTY_UNSAVED",
        targetType: "PROPERTY",
        targetId: propertyId,
        propertyId,
      });
      return NextResponse.json({ saved: false });
    }

    await prisma.savedProperty.create({
      data: { userId: session.id, propertyId },
    });

    await logActivity({
      actorId: session.id,
      eventType: "PROPERTY_SAVED",
      targetType: "PROPERTY",
      targetId: propertyId,
      propertyId,
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json({ error: "Failed to save property" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await prisma.savedProperty.findMany({
      where: { userId: session.id },
      include: {
        property: {
          include: { postedBy: { select: { name: true, role: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ saved });
  } catch (error) {
    console.error("Saved fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch saved" }, { status: 500 });
  }
}
