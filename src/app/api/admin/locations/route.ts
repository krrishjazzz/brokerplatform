import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { LOCATION_DICTIONARY } from "@/lib/location/dictionary";

export const dynamic = "force-dynamic";

function parseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** List location dictionary entries (DB first, static fallback). */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- available after `npx prisma generate`
    const rows = await (prisma as any).locationDictionary.findMany({
      where: { isActive: true },
      orderBy: [{ city: "asc" }, { locality: "asc" }],
    });

    if (rows.length > 0) {
      return NextResponse.json({
        source: "database",
        locations: rows.map((r: {
          id: string;
          city: string;
          locality: string;
          subLocality: string;
          aliases: string;
          zone: string | null;
          lat: number | null;
          lng: number | null;
          nearbyLocalityIds: string;
        }) => ({
          id: r.id,
          city: r.city,
          locality: r.locality,
          subLocality: r.subLocality,
          aliases: parseJsonArray(r.aliases),
          zone: r.zone,
          lat: r.lat,
          lng: r.lng,
          nearbyLocalityIds: parseJsonArray(r.nearbyLocalityIds),
        })),
      });
    }
  } catch {
    /* Prisma table may not exist until migrate */
  }

  return NextResponse.json({
    source: "static",
    locations: LOCATION_DICTIONARY.map((e) => ({
      id: e.id,
      city: e.city,
      locality: e.locality,
      subLocality: e.subLocality || "",
      aliases: e.aliases,
      zone: e.zone,
      nearbyLocalityIds: e.nearbyLocalityIds || [],
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const city = String(body.city || "").trim();
  const locality = String(body.locality || "").trim();
  const subLocality = String(body.subLocality || "").trim();
  const aliases: string[] = Array.isArray(body.aliases) ? body.aliases.map(String) : [];
  const zone = body.zone ? String(body.zone) : null;

  if (!city || !locality) {
    return NextResponse.json({ error: "city and locality are required" }, { status: 400 });
  }

  try {
    const row = await (prisma as any).locationDictionary.upsert({
      where: {
        city_locality_subLocality: { city, locality, subLocality: subLocality || "" },
      },
      create: {
        city,
        locality,
        subLocality: subLocality || "",
        aliases: JSON.stringify(aliases),
        zone,
        nearbyLocalityIds: JSON.stringify(body.nearbyLocalityIds || []),
      },
      update: {
        aliases: JSON.stringify(aliases),
        zone,
        isActive: true,
      },
    });

    return NextResponse.json({ location: row }, { status: 201 });
  } catch (error) {
    console.error("Location dictionary upsert error:", error);
    return NextResponse.json(
      { error: "Failed to save location. Run prisma migrate deploy first." },
      { status: 500 }
    );
  }
}
