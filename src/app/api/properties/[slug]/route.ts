import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { propertySchema } from "@/lib/validations";
import { logActivity } from "@/lib/workflow";
import { BROKER_VISIBLE_TYPES, CUSTOMER_VISIBLE_TYPES } from "@/lib/visibility";
import { formatProperty, toListingStatus } from "@/server/public-property";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            brokerProfile: {
              select: {
                rera: true,
                serviceAreas: true,
                responseScore: true,
                completedCollaborations: true,
                profileCompletion: true,
                lastActiveAt: true,
              },
            },
          },
        },
        assignedBroker: {
          select: {
            id: true,
            name: true,
            role: true,
            brokerProfile: {
              select: {
                rera: true,
                serviceAreas: true,
                responseScore: true,
                completedCollaborations: true,
                profileCompletion: true,
                lastActiveAt: true,
              },
            },
          },
        },
        freshnessHistory: { orderBy: { confirmedAt: "desc" }, take: 5, include: { confirmedBy: { select: { name: true, role: true } } } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const session = await getSession();
    const canViewAsBroker =
      session?.role === "BROKER" &&
      session.brokerStatus === "APPROVED" &&
      property.status !== "REJECTED" &&
      BROKER_VISIBLE_TYPES.includes(property.visibilityType);

    const canViewRestricted =
      session &&
      (session.role === "ADMIN" ||
        session.id === property.postedById ||
        session.id === property.assignedBrokerId ||
        canViewAsBroker ||
        (BROKER_VISIBLE_TYPES.includes(property.visibilityType) &&
          session.role === "BROKER" &&
          session.brokerStatus === "APPROVED"));

    if (property.status !== "LIVE" && !canViewRestricted) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.status === "LIVE" && !CUSTOMER_VISIBLE_TYPES.includes(property.visibilityType) && !canViewRestricted) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Similar listings: same intent + city, prefer same property type
    const similarCandidates = await prisma.property.findMany({
      where: {
        status: "LIVE",
        visibilityType: { in: CUSTOMER_VISIBLE_TYPES },
        city: property.city,
        listingType: property.listingType,
        id: { not: property.id },
        OR: [
          { propertyType: property.propertyType },
          { category: property.category },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { postedBy: { select: { name: true, role: true } } },
    });

    const similar = similarCandidates
      .sort((a, b) => {
        const score = (item: typeof a) =>
          (item.propertyType === property.propertyType ? 2 : 0) +
          (item.category === property.category ? 1 : 0);
        return score(b) - score(a);
      })
      .slice(0, 4);

    const publicView = !canViewRestricted;
    const processedProperty = formatProperty(property, { publicView });
    const processedSimilar = similar.map(prop => formatProperty(prop, { publicView: true }));

    return NextResponse.json({ property: processedProperty, similar: processedSimilar });
  } catch (error) {
    console.error("Property fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;
    const property = await prisma.property.findUnique({ where: { slug } });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.postedById !== session.id && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = propertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const {
      amenities,
      images,
      assignedBrokerId,
      publicBrokerName,
      visibilityType,
      coverImage,
      ...propertyData
    } = parsed.data;
    const normalizedVisibilityType = visibilityType === "PUBLIC_TO_CUSTOMERS" ? "FULL_VISIBILITY" : visibilityType;

    const nextStatus = session.role === "ADMIN" ? property.status : "PENDING_REVIEW";
    const data = {
      ...propertyData,
      amenities: JSON.stringify(amenities),
      images: JSON.stringify(images),
      coverImage: coverImage || images[0] || null,
      visibilityType: normalizedVisibilityType,
      publicBrokerName: publicBrokerName || "KrrishJazz",
      assignedBrokerId:
        session.role === "ADMIN" ? assignedBrokerId || null : property.assignedBrokerId,
      status: nextStatus,
      listingStatus: toListingStatus(nextStatus),
      rejectionReason: null,
    };

    const updated = await prisma.property.update({
      where: { slug },
      data,
    });

    await logActivity({
      actorId: session.id,
      eventType: "PROPERTY_UPDATED",
      targetType: "PROPERTY",
      targetId: property.id,
      propertyId: property.id,
      metadata: { nextStatus, visibilityType: normalizedVisibilityType },
    });

    return NextResponse.json({ property: updated });
  } catch (error) {
    console.error("Property update error:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}
