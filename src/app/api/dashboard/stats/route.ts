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

    if (session.canList) {
      const ownerPropertyWhere = { property: { postedById: session.id } };
      const [totalProperties, liveProperties, pendingReview, totalLeads, newLeads, visitRequests] =
        await Promise.all([
          prisma.property.count({ where: { postedById: session.id } }),
          prisma.property.count({ where: { postedById: session.id, status: "LIVE" } }),
          prisma.property.count({ where: { postedById: session.id, status: "PENDING_REVIEW" } }),
          prisma.enquiry.count({ where: ownerPropertyWhere }),
          prisma.enquiry.count({ where: { ...ownerPropertyWhere, status: "NEW" } }),
          prisma.enquiry.count({
            where: {
              ...ownerPropertyWhere,
              OR: [{ status: "VISIT_SCHEDULED" }, { visitDate: { not: null } }],
            },
          }),
        ]);
      return NextResponse.json({
        totalProperties,
        liveProperties,
        pendingReview,
        totalLeads,
        newLeads,
        visitRequests,
      });
    }

    if (session.role === "ADMIN") {
      const staleCutoff = new Date();
      staleCutoff.setDate(staleCutoff.getDate() - 14);

      const [
        totalUsers,
        totalProperties,
        pendingProperties,
        pendingBrokers,
        totalEnquiries,
        activeRequirements,
        hotRequirements,
        openCollaborations,
        staleProperties,
        newEnquiries,
      ] = await Promise.all([
        prisma.profile.count(),
        prisma.property.count(),
        prisma.property.count({ where: { status: "PENDING_REVIEW" } }),
        prisma.brokerProfile.count({ where: { status: "PENDING" } }),
        prisma.enquiry.count(),
        prisma.requirement.count({ where: { status: { in: ["ACTIVE", "MATCHING", "IN_DISCUSSION"] } } }),
        prisma.requirement.count({ where: { status: { in: ["ACTIVE", "MATCHING", "IN_DISCUSSION"] }, urgency: { in: ["HOT", "HIGH"] } } }),
        prisma.collaboration.count({ where: { status: { in: ["REQUESTED", "IN_DISCUSSION", "ACCEPTED"] } } }),
        prisma.property.count({
          where: {
            status: "LIVE",
            OR: [
              { updatedAt: { lt: staleCutoff } },
              { freshnessHistory: { none: {} } },
            ],
          },
        }),
        prisma.enquiry.count({ where: { status: "NEW" } }),
      ]);
      return NextResponse.json({
        totalUsers,
        totalProperties,
        pendingProperties,
        pendingBrokers,
        totalEnquiries,
        activeRequirements,
        hotRequirements,
        openCollaborations,
        staleProperties,
        newEnquiries,
      });
    }

    return NextResponse.json({});
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
