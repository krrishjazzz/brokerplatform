import { NextResponse } from "next/server";
import { getCitiesAsync } from "@/lib/location/search";

export const dynamic = "force-dynamic";

export async function GET() {
  const cities = await getCitiesAsync();
  return NextResponse.json({ cities });
}
