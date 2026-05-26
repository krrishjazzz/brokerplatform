import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { parseJsonObject } from "@/server/json";
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
    const source = searchParams.get("source") || "all";
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim().toLowerCase();

    const brokerWhere: Record<string, unknown> = {};
    if (status && status !== "ALL") brokerWhere.status = status;

    const [brokerRequirements, brokerTotal, brokerStatusGroups, searchEvents, searchTotal] =
      await Promise.all([
        source === "buyer"
          ? Promise.resolve([])
          : prisma.requirement.findMany({
              where: brokerWhere,
              orderBy: { createdAt: "desc" },
              skip: source === "broker" ? skip : 0,
              take: source === "broker" ? limit : 200,
              include: {
                broker: { select: { id: true, name: true, phone: true, role: true } },
                _count: { select: { collaborations: true } },
              },
            }),
        source === "buyer" ? Promise.resolve(0) : prisma.requirement.count({ where: brokerWhere }),
        source === "buyer"
          ? Promise.resolve([])
          : prisma.requirement.groupBy({
              by: ["status"],
              _count: { status: true },
            }),
        source === "broker"
          ? Promise.resolve([])
          : prisma.activityEvent.findMany({
              where: { eventType: "SEARCH_REQUIREMENT_CAPTURED", targetType: "SEARCH_REQUIREMENT" },
              orderBy: { createdAt: "desc" },
              skip: source === "buyer" ? skip : 0,
              take: source === "buyer" ? limit : 200,
              include: {
                actor: { select: { id: true, name: true, phone: true, role: true } },
              },
            }),
        source === "broker"
          ? Promise.resolve(0)
          : prisma.activityEvent.count({
              where: { eventType: "SEARCH_REQUIREMENT_CAPTURED", targetType: "SEARCH_REQUIREMENT" },
            }),
      ]);

    const brokerRows = brokerRequirements.map((r) => ({
      id: r.id,
      source: "broker" as const,
      description: r.description,
      propertyType: r.propertyType,
      locality: r.locality,
      city: r.city,
      budgetMin: r.budgetMin ? Number(r.budgetMin) : null,
      budgetMax: r.budgetMax ? Number(r.budgetMax) : null,
      status: r.status,
      urgency: r.urgency,
      clientSeriousness: r.clientSeriousness,
      notes: r.notes,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      broker: r.broker,
      matchCount: r._count.collaborations,
    }));

    const buyerRows = searchEvents.map((event) => {
      const meta = parseJsonObject(event.metadata);
      return {
        id: event.targetId,
        activityId: event.id,
        source: "buyer" as const,
        description: String(meta.notes || meta.requirementType || "Buyer search brief"),
        propertyType: String(meta.requirementType || meta.propertyType || "—"),
        locality: String(meta.locality || ""),
        city: String(meta.city || "—"),
        budgetMin: meta.budgetMin != null ? Number(meta.budgetMin) : null,
        budgetMax: meta.budgetMax != null ? Number(meta.budgetMax) : null,
        status: String(meta.status || "NEW"),
        urgency: String(meta.urgency || "NORMAL"),
        clientSeriousness: String(meta.clientSeriousness || "—"),
        notes: String(meta.notes || ""),
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.createdAt.toISOString(),
        contactName: String(meta.name || event.actor?.name || "Guest"),
        contactPhone: String(meta.phone || event.actor?.phone || "—"),
        userRole: String(meta.userRole || event.actor?.role || "GUEST"),
        actor: event.actor,
        matchCount: 0,
      };
    });

    let rows =
      source === "broker" ? brokerRows : source === "buyer" ? buyerRows : [...brokerRows, ...buyerRows];

    rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (q) {
      rows = rows.filter((row) =>
        [
          row.description,
          row.propertyType,
          row.city,
          row.locality,
          row.status,
          row.source === "buyer" ? row.contactName : row.broker?.name,
          row.source === "buyer" ? row.contactPhone : row.broker?.phone,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q))
      );
    }

    const total =
      source === "broker" ? brokerTotal : source === "buyer" ? searchTotal : brokerTotal + searchTotal;

    const pagedRows = source === "all" ? rows.slice(skip, skip + limit) : rows;

    return NextResponse.json({
      requirements: pagedRows,
      pagination: {
        page,
        limit,
        total: source === "all" && q ? rows.length : total,
        totalPages: Math.max(1, Math.ceil((source === "all" && q ? rows.length : total) / limit)),
      },
      counts: {
        broker: brokerTotal,
        buyer: searchTotal,
        all: brokerTotal + searchTotal,
      },
      statusCounts: Object.fromEntries(brokerStatusGroups.map((g) => [g.status, g._count.status])),
    });
  } catch (error) {
    console.error("Admin requirements list error:", error);
    return NextResponse.json({ error: "Failed to fetch requirements" }, { status: 500 });
  }
}
