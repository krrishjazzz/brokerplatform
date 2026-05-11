import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { searchRequirementSchema } from "@/lib/validations";
import { logActivity } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`search-requirement:${ip}`, 6, 3600000)) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const session = await getSession();
    const body = await req.json();
    const parsed = searchRequirementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const requestId = `search-${nanoid(10)}`;
    await logActivity({
      actorId: session?.id || null,
      eventType: "SEARCH_REQUIREMENT_CAPTURED",
      targetType: "SEARCH_REQUIREMENT",
      targetId: requestId,
      metadata: {
        ...parsed.data,
        userId: session?.id || null,
        userRole: session?.role || "GUEST",
        status: "NEW",
      },
    });

    return NextResponse.json({ requestId }, { status: 201 });
  } catch (error) {
    console.error("Search requirement capture error:", error);
    return NextResponse.json({ error: "Failed to submit requirement" }, { status: 500 });
  }
}
