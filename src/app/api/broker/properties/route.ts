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
      status: { not: "REJECTED" }, // Show all non-rejected properties
    };

    const listingType = searchParams.get("listingType");
    if (listingType) where.listingType = listingType;

    const category = searchParams.get("category");
    if (category) where.category = category;

    const propertyType = searchParams.get("propertyType");
    if (propertyType) where.propertyType = propertyType;

    const city = searchParams.get("city");
    if (city) where.city = { contains: city };

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
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    const processedProperties = properties.map((property) => {
      let images: string[] = [];
      try {
        images = property.images ? JSON.parse(property.images) : [];
      } catch (error) {
        images = [];
      }

      return {
        id: property.id,
        slug: property.slug,
        title: property.title,
        city: property.city,
        price: Number(property.price),
        listingType: property.listingType,
        propertyType: property.propertyType,
        coverImage: property.coverImage,
        images,
        assignedBrokerId: property.assignedBrokerId,
        assignedBroker: property.assignedBroker,
        publicBrokerName: property.publicBrokerName,
        verified: property.status === "LIVE",
        area: property.area,
        areaUnit: property.areaUnit,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        furnishing: property.furnishing,
        status: property.status,
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