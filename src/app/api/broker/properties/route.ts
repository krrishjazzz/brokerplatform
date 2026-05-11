import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "BROKER" || session.brokerStatus !== "APPROVED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const skip = (page - 1) * limit;

    const where: any = {
      status: { notIn: ["REJECTED", "CLOSED"] },
      visibilityType: { not: "PRIVATE" },
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

    const processedProperties = await Promise.all(properties.map(async (property) => {
      let images: string[] = [];
      let amenities: string[] = [];
      try {
        images = property.images ? JSON.parse(property.images) : [];
      } catch {
        images = [];
      }
      try {
        amenities = property.amenities ? JSON.parse(property.amenities) : [];
      } catch {
        amenities = [];
      }

      const matchingRequirementsCount = await prisma.requirement.count({
        where: {
          status: { in: ["ACTIVE", "MATCHING", "IN_DISCUSSION"] },
          propertyType: property.propertyType,
          city: { contains: property.city },
          ...(property.locality ? { OR: [{ locality: { contains: property.locality } }, { locality: "" }] } : {}),
          AND: [
            {
              OR: [
                { budgetMin: { lte: property.price } },
                { budgetMin: null },
              ],
            },
            {
              OR: [
                { budgetMax: { gte: property.price } },
                { budgetMax: null },
              ],
            },
          ],
        },
      });

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
        images,
        amenities,
        assignedBrokerId: property.assignedBrokerId,
        assignedBroker: property.assignedBroker,
        publicBrokerName: property.publicBrokerName,
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
    }));

    return NextResponse.json({
      properties: processedProperties,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Broker properties fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}
