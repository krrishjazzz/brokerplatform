import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SEARCH_CITY } from "@/lib/search-intent-config";
import { suggestLocations } from "@/lib/location/search";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const city = searchParams.get("city") || DEFAULT_SEARCH_CITY;

  const groups = suggestLocations(q, city);
  return NextResponse.json({ city, query: q, groups });
}
