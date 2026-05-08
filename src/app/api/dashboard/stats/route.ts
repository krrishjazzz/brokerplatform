import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "CUSTOMER") {
      const [enquiries, saved] = await Promise.all([
        prisma.enquiry.count({ where: { customerId: session.id } }),
        prisma.savedProperty.count({ where: { userId: session.id } }),
      ]);
      return NextResponse.json({ enquiries, saved });
    }

    if (session.role === "OWNER" || session.role === "BROKER") {
      const [totalProperties, liveProperties, totalLeads, newLeads] = await Promise.all([
        prisma.property.count({ where: { postedById: session.id } }),
        prisma.property.count({ where: { postedById: session.id, status: "LIVE" } }),
        prisma.enquiry.count({ where: { property: { postedById: session.id } } }),
        prisma.enquiry.count({ where: { property: { postedById: session.id }, status: "NEW" } }),
      ]);
      return NextResponse.json({ totalProperties, liveProperties, totalLeads, newLeads });
    }

    if (session.role === "ADMIN") {
      const [totalUsers, totalProperties, pendingProperties, pendingBrokers, totalEnquiries] = await Promise.all([
        prisma.profile.count(),
        prisma.property.count(),
        prisma.property.count({ where: { status: "PENDING_REVIEW" } }),
        prisma.brokerProfile.count({ where: { status: "PENDING" } }),
        prisma.enquiry.count(),
      ]);
      return NextResponse.json({ totalUsers, totalProperties, pendingProperties, pendingBrokers, totalEnquiries });
    }

    return NextResponse.json({});
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
