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

    const where: any = {};
    const andFilters: any[] = [];

    const q = searchParams.get("q");
    if (q) {
      where.OR = [
        { description: { contains: q } },
        { city: { contains: q } },
        { propertyType: { contains: q } },
      ];
    }

    const propertyType = searchParams.get("propertyType");
    if (propertyType) where.propertyType = propertyType;

    const city = searchParams.get("city");
    if (city) where.city = { contains: city };

    const minBudget = searchParams.get("minBudget");
    if (minBudget) {
      andFilters.push({
        OR: [
          { budgetMax: { gte: parseFloat(minBudget) } },
          { budgetMax: null },
        ],
      });
    }

    const maxBudget = searchParams.get("maxBudget");
    if (maxBudget) {
      andFilters.push({
        OR: [
          { budgetMin: { lte: parseFloat(maxBudget) } },
          { budgetMin: null },
        ],
      });
    }

    const urgency = searchParams.get("urgency");
    if (urgency) {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);

      if (urgency === "new") {
        where.createdAt = { gte: sevenDaysAgo };
      } else if (urgency === "recent") {
        where.createdAt = { gte: thirtyDaysAgo, lt: sevenDaysAgo };
      } else if (urgency === "old") {
        where.createdAt = { lt: thirtyDaysAgo };
      }
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    const [requirements, total] = await Promise.all([
      prisma.requirement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          broker: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
      }),
      prisma.requirement.count({ where }),
    ]);

    const processedRequirements = requirements.map((req) => ({
      id: req.id,
      description: req.description,
      propertyType: req.propertyType,
      city: req.city,
      budgetMin: req.budgetMin ? Number(req.budgetMin) : null,
      budgetMax: req.budgetMax ? Number(req.budgetMax) : null,
      createdAt: req.createdAt.toISOString(),
      broker: req.broker,
    }));

    return NextResponse.json({
      requirements: processedRequirements,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get requirements error:", error);
    return NextResponse.json({ error: "Failed to fetch requirements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "BROKER") {
      return NextResponse.json({ error: "Only brokers can post requirements" }, { status: 403 });
    }

    const body = await req.json();
    const { description, propertyType, city, budgetMin, budgetMax } = body;

    if (!description || !propertyType || !city) {
      return NextResponse.json(
        { error: "Description, property type, and city are required" },
        { status: 400 }
      );
    }

    const requirement = await prisma.requirement.create({
      data: {
        brokerId: session.id,
        description,
        propertyType,
        city,
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
      },
    });

    return NextResponse.json({ requirement }, { status: 201 });
  } catch (error) {
    console.error("Create requirement error:", error);
    return NextResponse.json({ error: "Failed to create requirement" }, { status: 500 });
  }
}
