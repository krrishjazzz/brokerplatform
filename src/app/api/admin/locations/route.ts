import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { invalidateLocationCache } from "@/lib/location/repository";
import { slugifyLocation } from "@/lib/location/normalize";

export const dynamic = "force-dynamic";

function parseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function mapRow(r: {
  id: string;
  name: string;
  slug: string;
  type: string;
  parentId: string | null;
  cityId: string | null;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  aliases: string;
  nearbyIds: string;
  priority: number;
  isActive: boolean;
}) {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    type: r.type,
    parentId: r.parentId,
    cityId: r.cityId,
    state: r.state,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
    aliases: parseJsonArray(r.aliases),
    nearbyIds: parseJsonArray(r.nearbyIds),
    priority: r.priority,
    isActive: r.isActive,
  };
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const type = new URL(req.url).searchParams.get("type");
  const rows = await prisma.location.findMany({
    where: type ? { type } : undefined,
    orderBy: [{ priority: "desc" }, { name: "asc" }],
    take: 500,
  });

  return NextResponse.json({
    locations: rows.map(mapRow),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const name = String(body.name || "").trim();
  const type = String(body.type || "locality").trim();
  const parentId = body.parentId ? String(body.parentId) : null;
  const cityId = body.cityId ? String(body.cityId) : null;
  const state = String(body.state || "").trim();
  const country = String(body.country || "India").trim();
  const aliases: string[] = Array.isArray(body.aliases) ? body.aliases.map(String) : [];
  const nearbyIds: string[] = Array.isArray(body.nearbyIds) ? body.nearbyIds.map(String) : [];
  const priority = Number(body.priority) || 0;
  const slug = String(body.slug || slugifyLocation(name)).trim();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    const row = await prisma.location.create({
      data: {
        name,
        slug,
        type,
        parentId,
        cityId: type === "city" ? undefined : cityId,
        state,
        country,
        aliases: JSON.stringify(aliases),
        nearbyIds: JSON.stringify(nearbyIds),
        priority,
        latitude: body.latitude != null ? Number(body.latitude) : null,
        longitude: body.longitude != null ? Number(body.longitude) : null,
        isActive: body.isActive !== false,
      },
    });

    if (type === "city") {
      await prisma.location.update({
        where: { id: row.id },
        data: { cityId: row.id },
      });
    }

    invalidateLocationCache();
    return NextResponse.json({ location: mapRow(row) }, { status: 201 });
  } catch (error) {
    console.error("Location create error:", error);
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const id = String(body.id || "").trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.name != null) data.name = String(body.name).trim();
  if (body.slug != null) data.slug = String(body.slug).trim();
  if (body.type != null) data.type = String(body.type);
  if (body.parentId !== undefined) data.parentId = body.parentId || null;
  if (body.cityId !== undefined) data.cityId = body.cityId || null;
  if (body.state != null) data.state = String(body.state);
  if (body.country != null) data.country = String(body.country);
  if (body.aliases != null) data.aliases = JSON.stringify(body.aliases);
  if (body.nearbyIds != null) data.nearbyIds = JSON.stringify(body.nearbyIds);
  if (body.priority != null) data.priority = Number(body.priority);
  if (body.isActive != null) data.isActive = Boolean(body.isActive);
  if (body.latitude != null) data.latitude = Number(body.latitude);
  if (body.longitude != null) data.longitude = Number(body.longitude);

  try {
    const row = await prisma.location.update({ where: { id }, data });
    invalidateLocationCache();
    return NextResponse.json({ location: mapRow(row) });
  } catch (error) {
    console.error("Location update error:", error);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}
