import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordPropertyMetric, type PropertyMetricEvent } from "@/lib/property-analytics";

export const dynamic = "force-dynamic";

const ALLOWED: PropertyMetricEvent[] = ["VIEW", "SEARCH_IMPRESSION", "CLICK"];

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const property = await prisma.property.findUnique({
      where: { slug: params.slug },
      select: { id: true, status: true },
    });

    if (!property || property.status !== "LIVE") {
      return NextResponse.json({ ok: true });
    }

    const body = await req.json().catch(() => ({}));
    const event = body.event as PropertyMetricEvent;
    if (!ALLOWED.includes(event)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    await recordPropertyMetric(property.id, event);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Property metric error:", error);
    return NextResponse.json({ error: "Failed to record metric" }, { status: 500 });
  }
}
