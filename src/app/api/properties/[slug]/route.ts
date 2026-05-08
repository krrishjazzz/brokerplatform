import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { propertySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

function toListingStatus(status: string) {
  if (status === "PENDING_REVIEW") return "PENDING";
  if (status === "LIVE") return "LIVE";
  if (status === "REJECTED") return "REJECTED";
  return status;
}

function formatProperty(property: any, options: { publicView: boolean }) {
  const listingStatus = ["LIVE", "REJECTED"].includes(property.status)
    ? toListingStatus(property.status)
    : property.listingStatus || toListingStatus(property.status);

  const formatted = {
    ...property,
    listingStatus,
    publicBrokerName: property.publicBrokerName || "KrrishJazz",
    verified: property.status === "LIVE" || listingStatus === "LIVE",
    amenities: JSON.parse(property.amenities || "[]"),
    images: JSON.parse(property.images || "[]"),
  };

  if (!options.publicView) return formatted;

  const safeProperty = { ...formatted };
  delete safeProperty.postedById;
  delete safeProperty.assignedBrokerId;
  delete safeProperty.assignedBroker;

  return {
    ...safeProperty,
    postedBy: { name: formatted.publicBrokerName, phone: "", role: "VERIFIED", brokerProfile: null },
  };
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        postedBy: {
          select: { id: true, name: true, phone: true, role: true, brokerProfile: { select: { rera: true } } },
        },
        assignedBroker: {
          select: { id: true, name: true, role: true, brokerProfile: { select: { rera: true } } },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const session = await getSession();
    const canViewRestricted =
      session &&
      (session.role === "ADMIN" ||
        session.id === property.postedById ||
        session.id === property.assignedBrokerId ||
        (property.visibilityType === "BROKER_NETWORK_ONLY" &&
          session.role === "BROKER" &&
          session.brokerStatus === "APPROVED"));

    if (property.status !== "LIVE" && !canViewRestricted) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.status === "LIVE" && property.visibilityType !== "PUBLIC_TO_CUSTOMERS" && !canViewRestricted) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Get similar properties
    const similar = await prisma.property.findMany({
      where: {
        status: "LIVE",
        visibilityType: "PUBLIC_TO_CUSTOMERS",
        city: property.city,
        category: property.category,
        id: { not: property.id },
      },
      take: 4,
      include: { postedBy: { select: { name: true, role: true } } },
    });

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
      ...propertyData
    } = parsed.data;

    const nextStatus = session.role === "ADMIN" ? property.status : "PENDING_REVIEW";
    const data = {
      ...propertyData,
      amenities: JSON.stringify(amenities),
      images: JSON.stringify(images),
      visibilityType,
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

    return NextResponse.json({ property: updated });
  } catch (error) {
    console.error("Property update error:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}
