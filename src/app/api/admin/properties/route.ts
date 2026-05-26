import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getPagination } from "@/server/pagination";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPagination(searchParams, { defaultLimit: 25, maxLimit: 100 });

    const where: Record<string, unknown> = {};
    const status = searchParams.get("status");
    if (status && status !== "ALL") where.status = status;

    const listingType = searchParams.get("listingType");
    if (listingType) where.listingType = listingType;

    const city = searchParams.get("city")?.trim();
    if (city) where.city = { contains: city, mode: "insensitive" };

    const q = searchParams.get("q")?.trim();
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { propertyType: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { locality: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { postedBy: { name: { contains: q, mode: "insensitive" } } },
        { postedBy: { phone: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [properties, total, statusGroups] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          postedBy: { select: { id: true, name: true, phone: true, role: true } },
          assignedBroker: { select: { id: true, name: true, role: true } },
          _count: { select: { enquiries: true, saved: true } },
        },
      }),
      prisma.property.count({ where }),
      prisma.property.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    return NextResponse.json({
      properties: properties.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        propertyType: p.propertyType,
        listingType: p.listingType,
        category: p.category,
        city: p.city,
        locality: p.locality,
        price: Number(p.price),
        status: p.status,
        listingStatus: p.listingStatus,
        visibilityType: p.visibilityType,
        bedrooms: p.bedrooms,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        postedBy: p.postedBy,
        assignedBroker: p.assignedBroker,
        enquiryCount: p._count.enquiries,
        saveCount: p._count.saved,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      statusCounts: Object.fromEntries(statusGroups.map((g) => [g.status, g._count.status])),
    });
  } catch (error) {
    console.error("Admin properties list error:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}
