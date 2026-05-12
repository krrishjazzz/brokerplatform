import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { requirementSchema } from "@/lib/validations";
import { logActivity } from "@/lib/workflow";
import { BROKER_VISIBLE_TYPES } from "@/lib/visibility";
import { countPropertiesForRequirement, uniqueText } from "@/server/broker-matching";
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

    const where: any = {};
    const andFilters: any[] = [];

    const q = searchParams.get("q");
    if (q) {
      where.OR = [
        { description: { contains: q } },
        { city: { contains: q } },
        { locality: { contains: q } },
        { propertyType: { contains: q } },
      ];
    }

    const propertyType = searchParams.get("propertyType");
    if (propertyType) where.propertyType = propertyType;

    const city = searchParams.get("city");
    if (city) where.city = { contains: city };

    const locality = searchParams.get("locality");
    if (locality) where.locality = { contains: locality };

    const status = searchParams.get("status");
    where.status = status || { in: ["ACTIVE", "MATCHING", "IN_DISCUSSION"] };

    const seriousness = searchParams.get("clientSeriousness");
    if (seriousness) where.clientSeriousness = seriousness;

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

      if (["LOW", "NORMAL", "HIGH", "HOT"].includes(urgency)) {
        where.urgency = urgency;
      } else if (urgency === "new") {
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
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      }),
      prisma.requirement.count({ where }),
    ]);

    const requirementTypes = uniqueText(requirements.map((requirement) => requirement.propertyType));
    const requirementCities = uniqueText(requirements.map((requirement) => requirement.city));
    const candidateProperties = requirements.length
      ? await prisma.property.findMany({
          where: {
            status: { notIn: ["REJECTED", "CLOSED"] },
            visibilityType: { in: BROKER_VISIBLE_TYPES },
            ...(requirementTypes.length ? { propertyType: { in: requirementTypes } } : {}),
            ...(requirementCities.length
              ? { OR: requirementCities.map((city) => ({ city: { contains: city } })) }
              : {}),
          },
          select: {
            id: true,
            propertyType: true,
            city: true,
            locality: true,
            price: true,
          },
        })
      : [];

    const processedRequirements = requirements.map((req) => {
      const minBudget = req.budgetMin ? Number(req.budgetMin) : null;
      const maxBudget = req.budgetMax ? Number(req.budgetMax) : null;
      const matchedPropertiesCount = countPropertiesForRequirement(req, candidateProperties);

      return {
        id: req.id,
        description: req.description,
        propertyType: req.propertyType,
        locality: req.locality,
        city: req.city,
        budgetMin: minBudget,
        budgetMax: maxBudget,
        status: req.status,
        urgency: req.urgency,
        clientSeriousness: req.clientSeriousness,
        notes: req.notes,
        expiresAt: req.expiresAt?.toISOString() || null,
        matchedPropertiesCount,
        createdAt: req.createdAt.toISOString(),
        broker: req.broker,
      };
    });

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

    if (session.brokerStatus !== "APPROVED") {
      return NextResponse.json({ error: "Broker account not yet approved" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = requirementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const requirement = await prisma.requirement.create({
      data: {
        brokerId: session.id,
        description: parsed.data.description,
        propertyType: parsed.data.propertyType,
        locality: parsed.data.locality || "",
        city: parsed.data.city,
        budgetMin: parsed.data.budgetMin || null,
        budgetMax: parsed.data.budgetMax || null,
        status: parsed.data.status,
        urgency: parsed.data.urgency,
        clientSeriousness: parsed.data.clientSeriousness,
        notes: parsed.data.notes || null,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });

    await prisma.brokerProfile.updateMany({
      where: { profileId: session.id },
      data: { lastActiveAt: new Date() },
    });

    await logActivity({
      actorId: session.id,
      eventType: "REQUIREMENT_POSTED",
      targetType: "REQUIREMENT",
      targetId: requirement.id,
      requirementId: requirement.id,
      metadata: {
        city: requirement.city,
        locality: requirement.locality,
        urgency: requirement.urgency,
      },
    });

    return NextResponse.json({ requirement }, { status: 201 });
  } catch (error) {
    console.error("Create requirement error:", error);
    return NextResponse.json({ error: "Failed to create requirement" }, { status: 500 });
  }
}
