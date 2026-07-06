import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatCrmListing } from "@/server/broker-crm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.brokerStatus !== "APPROVED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const properties = await prisma.property.findMany({
      where: {
        status: { notIn: ["REJECTED", "CLOSED"] },
        OR: [{ postedById: session.id }, { assignedBrokerId: session.id }],
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ listings: properties.map(formatCrmListing) });
  } catch (error) {
    console.error("CRM listings GET error:", error);
    return NextResponse.json({ error: "Failed to load listings" }, { status: 500 });
  }
}
