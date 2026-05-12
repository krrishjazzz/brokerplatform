import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { BROKER_VISIBLE_TYPES } from "@/lib/visibility";
import { countRequirementsForProperty, uniqueText } from "@/server/broker-matching";
import { parseJsonArray } from "@/server/json";
import { getPagination } from "@/server/pagination";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "BROKER" || session.brokerStatus !== "APPROVED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPagination(searchParams);

    const where: any = {
      status: { notIn: ["REJECTED", "CLOSED"] },
      visibilityType: { in: BROKER_VISIBLE_TYPES },
    };

    const listingType = searchParams.get("listingType");
    if (listingType) where.listingType = listingType;

    const category = searchParams.get("category");
    if (category) where.category = category;

    const propertyType = searchParams.get("propertyType");
    if (propertyType) where.propertyType = propertyType;

    const city = searchParams.get("city");
    if (city) where.city = { contains: city };

    const locality = searchParams.get("locality");
    if (locality) where.locality = { contains: locality };

    const availability = searchParams.get("availability");
    const listingStatus = searchParams.get("listingStatus");
    if (availability || listingStatus) where.listingStatus = availability || listingStatus;

    const fresh = searchParams.get("fresh");
    if (fresh === "true") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      where.updatedAt = { gte: sevenDaysAgo };
    }

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as any).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as any).lte = parseFloat(maxPrice);
    }

    const q = searchParams.get("q");
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { city: { contains: q } },
        { locality: { contains: q } },
        { address: { contains: q } },
      ];
    }

    const sort = searchParams.get("sort");
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          postedBy: { select: { id: true, name: true, phone: true, role: true } },
          assignedBroker: {
            select: {
              name: true,
              phone: true,
              brokerProfile: {
                select: {
                  rera: true,
                  city: true,
                  responseScore: true,
                  profileCompletion: true,
                  completedCollaborations: true,
                  lastActiveAt: true,
                },
              },
            },
          },
          freshnessHistory: { orderBy: { confirmedAt: "desc" }, take: 1 },
        },
      }),
      prisma.property.count({ where }),
    ]);

    const propertyTypes = uniqueText(properties.map((property) => property.propertyType));
    const propertyCities = uniqueText(properties.map((property) => property.city));
    const candidateRequirements = properties.length
      ? await prisma.requirement.findMany({
          where: {
            status: { in: ["ACTIVE", "MATCHING", "IN_DISCUSSION"] },
            ...(propertyTypes.length ? { propertyType: { in: propertyTypes } } : {}),
            ...(propertyCities.length
              ? { OR: propertyCities.map((city) => ({ city: { contains: city } })) }
              : {}),
          },
          select: {
            id: true,
            propertyType: true,
            city: true,
            locality: true,
            budgetMin: true,
            budgetMax: true,
          },
        })
      : [];

    const processedProperties = properties.map((property) => {
      const matchingRequirementsCount = countRequirementsForProperty(property, candidateRequirements);

      const sourceType =
        property.postedById === session.id || property.assignedBrokerId === session.id
          ? "YOUR_PROPERTY"
          : property.postedBy?.role === "OWNER"
          ? "KRRISHJAZZ_OWNER_PROPERTY"
          : "BROKER_NETWORK_PROPERTY";
      const sourceLabel =
        sourceType === "YOUR_PROPERTY"
          ? "Your Property"
          : sourceType === "KRRISHJAZZ_OWNER_PROPERTY"
          ? "KrrishJazz Managed Owner Property"
          : "Broker Network Property";
      const sourceName =
        sourceType === "KRRISHJAZZ_OWNER_PROPERTY"
          ? "KrrishJazz"
          : sourceType === "YOUR_PROPERTY"
          ? session.name || "You"
          : property.assignedBroker?.name || property.postedBy?.name || "Network Broker";
      const sourcePhone =
        sourceType === "KRRISHJAZZ_OWNER_PROPERTY"
          ? process.env.NEXT_PUBLIC_PLATFORM_PHONE || ""
          : sourceType === "YOUR_PROPERTY"
          ? session.phone
          : property.assignedBroker?.phone || property.postedBy?.phone || "";

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
        assignedBroker: property.assignedBroker ? { name: property.assignedBroker.name, phone: property.assignedBroker.phone } : null,
        publicBrokerName: sourceLabel,
        sourceType,
        sourceLabel,
        sourceName,
        sourcePhone,
        verified: property.status === "LIVE",
        area: property.area,
        areaUnit: property.areaUnit,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        floor: property.floor,
        totalFloors: property.totalFloors,
        ageYears: property.ageYears,
        furnishing: property.furnishing,
        visibilityType: property.visibilityType,
        listingStatus: property.listingStatus,
        status: property.status,
        matchingRequirementsCount,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        latestFreshness: property.freshnessHistory?.[0] || null,
      };
    });

    return NextResponse.json({
      properties: processedProperties,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Broker properties fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}
