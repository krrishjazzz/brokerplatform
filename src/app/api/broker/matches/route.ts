import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity, scoreMatch } from "@/lib/workflow";
import { BROKER_VISIBLE_TYPES } from "@/lib/visibility";

export const dynamic = "force-dynamic";

function parseJsonArray(value: string | null) {
  try {
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function getSourceMeta(property: any, session: { id: string; name?: string | null; phone?: string | null }) {
  const sourceType =
    property.postedById === session.id || property.assignedBrokerId === session.id
      ? "YOUR_PROPERTY"
      : property.postedBy?.role === "OWNER"
      ? "KRRISHJAZZ_OWNER_PROPERTY"
      : "BROKER_NETWORK_PROPERTY";

  return {
    sourceType,
    sourceLabel:
      sourceType === "YOUR_PROPERTY"
        ? "Your Property"
        : sourceType === "KRRISHJAZZ_OWNER_PROPERTY"
        ? "KrrishJazz Managed Owner Property"
        : "Broker Network Property",
    sourceName:
      sourceType === "KRRISHJAZZ_OWNER_PROPERTY"
        ? "KrrishJazz"
        : sourceType === "YOUR_PROPERTY"
        ? session.name || "You"
        : property.assignedBroker?.name || property.postedBy?.name || "Network Broker",
    sourcePhone:
      sourceType === "KRRISHJAZZ_OWNER_PROPERTY"
        ? process.env.NEXT_PUBLIC_PLATFORM_PHONE || ""
        : sourceType === "YOUR_PROPERTY"
        ? session.phone || ""
        : property.assignedBroker?.phone || property.postedBy?.phone || "",
  };
}

function formatProperty(property: any, session: { id: string; name?: string | null; phone?: string | null }) {
  const source = getSourceMeta(property, session);
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    description: property.description,
    address: property.address,
    locality: property.locality,
    city: property.city,
    state: property.state,
    pincode: property.pincode,
    price: Number(property.price),
    listingType: property.listingType,
    category: property.category,
    propertyType: property.propertyType,
    coverImage: property.coverImage,
    images: parseJsonArray(property.images),
    amenities: parseJsonArray(property.amenities),
    assignedBrokerId: property.assignedBrokerId,
    assignedBroker: property.assignedBroker ? { id: property.assignedBroker.id, name: property.assignedBroker.name, phone: property.assignedBroker.phone } : null,
    postedById: property.postedById,
    postedBy: property.postedBy ? { id: property.postedBy.id, name: property.postedBy.name, phone: property.postedBy.phone, role: property.postedBy.role } : null,
    publicBrokerName: source.sourceLabel,
    sourceType: source.sourceType,
    sourceLabel: source.sourceLabel,
    sourceName: source.sourceName,
    sourcePhone: source.sourcePhone,
    verified: property.status === "LIVE",
    area: property.area,
    areaUnit: property.areaUnit,
    furnishing: property.furnishing,
    listingStatus: property.listingStatus,
    status: property.status,
    updatedAt: property.updatedAt,
    latestFreshness: property.freshnessHistory?.[0] || null,
  };
}

function formatRequirement(requirement: any) {
  return {
    id: requirement.id,
    description: requirement.description,
    propertyType: requirement.propertyType,
    locality: requirement.locality,
    city: requirement.city,
    budgetMin: requirement.budgetMin ? Number(requirement.budgetMin) : null,
    budgetMax: requirement.budgetMax ? Number(requirement.budgetMax) : null,
    status: requirement.status,
    urgency: requirement.urgency,
    clientSeriousness: requirement.clientSeriousness,
    notes: requirement.notes,
    expiresAt: requirement.expiresAt?.toISOString() || null,
    createdAt: requirement.createdAt.toISOString(),
    broker: requirement.broker,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "BROKER" || session.brokerStatus !== "APPROVED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");
    const id = searchParams.get("id");
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "8")));

    if (!mode || !id) {
      return NextResponse.json({ error: "mode and id are required" }, { status: 400 });
    }

    await prisma.brokerProfile.updateMany({
      where: { profileId: session.id },
      data: { lastActiveAt: new Date() },
    });

    if (mode === "property") {
      const property = await prisma.property.findUnique({ where: { id } });
      if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

      const requirements = await prisma.requirement.findMany({
        where: {
          status: { in: ["ACTIVE", "MATCHING", "IN_DISCUSSION"] },
          propertyType: property.propertyType,
          city: { contains: property.city },
          ...(property.locality ? { OR: [{ locality: { contains: property.locality } }, { locality: "" }] } : {}),
          AND: [
            { OR: [{ budgetMin: { lte: property.price } }, { budgetMin: null }] },
            { OR: [{ budgetMax: { gte: property.price } }, { budgetMax: null }] },
          ],
        },
        orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
        take: limit,
        include: { broker: { select: { id: true, name: true, phone: true } } },
      });

      const matches = requirements.map((requirement) => {
        const formatted = formatRequirement(requirement);
        return {
          ...formatted,
          match: scoreMatch({
            propertyCity: property.city,
            propertyLocality: property.locality,
            propertyType: property.propertyType,
            price: Number(property.price),
            requirementCity: requirement.city,
            requirementLocality: requirement.locality,
            requirementType: requirement.propertyType,
            budgetMin: formatted.budgetMin,
            budgetMax: formatted.budgetMax,
          }),
        };
      });

      await logActivity({
        actorId: session.id,
        eventType: "MATCH_DRAWER_OPENED",
        targetType: "PROPERTY",
        targetId: property.id,
        propertyId: property.id,
        metadata: { resultCount: matches.length },
      });

      return NextResponse.json({ propertyId: property.id, requirements: matches });
    }

    if (mode === "requirement") {
      const requirement = await prisma.requirement.findUnique({ where: { id } });
      if (!requirement) return NextResponse.json({ error: "Requirement not found" }, { status: 404 });

      const where: any = {
        status: { notIn: ["REJECTED", "CLOSED"] },
        visibilityType: { in: BROKER_VISIBLE_TYPES },
        propertyType: requirement.propertyType,
        city: { contains: requirement.city },
      };
      if (requirement.locality) where.locality = { contains: requirement.locality };
      const andFilters: any[] = [];
      if (requirement.budgetMin) andFilters.push({ price: { gte: requirement.budgetMin } });
      if (requirement.budgetMax) andFilters.push({ price: { lte: requirement.budgetMax } });
      if (andFilters.length > 0) where.AND = andFilters;

      const properties = await prisma.property.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: limit,
        include: {
          assignedBroker: { select: { id: true, name: true, phone: true } },
          postedBy: { select: { id: true, name: true, phone: true, role: true } },
          freshnessHistory: { orderBy: { confirmedAt: "desc" }, take: 1 },
        },
      });

      const formattedRequirement = formatRequirement({
        ...requirement,
        broker: { id: session.id, name: session.name, phone: session.phone },
      });
      const matches = properties.map((property) => ({
        ...formatProperty(property, session),
        match: scoreMatch({
          propertyCity: property.city,
          propertyLocality: property.locality,
          propertyType: property.propertyType,
          price: Number(property.price),
          requirementCity: requirement.city,
          requirementLocality: requirement.locality,
          requirementType: requirement.propertyType,
          budgetMin: formattedRequirement.budgetMin,
          budgetMax: formattedRequirement.budgetMax,
        }),
      }));

      await logActivity({
        actorId: session.id,
        eventType: "MATCH_DRAWER_OPENED",
        targetType: "REQUIREMENT",
        targetId: requirement.id,
        requirementId: requirement.id,
        metadata: { resultCount: matches.length },
      });

      return NextResponse.json({ requirementId: requirement.id, properties: matches });
    }

    return NextResponse.json({ error: "Invalid match mode" }, { status: 400 });
  } catch (error) {
    console.error("Broker matches error:", error);
    return NextResponse.json({ error: "Failed to load matches" }, { status: 500 });
  }
}
