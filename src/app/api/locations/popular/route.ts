import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SEARCH_CITY } from "@/lib/search-intent-config";
import { getPopularLocationsAsync } from "@/lib/location/search";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || DEFAULT_SEARCH_CITY;
  const limit = Math.min(Number(searchParams.get("limit") || 8), 20);

  const locations = await getPopularLocationsAsync(city, limit);
  return NextResponse.json({ city, locations });
}
