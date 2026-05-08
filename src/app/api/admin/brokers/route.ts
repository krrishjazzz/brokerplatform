import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const brokers = await prisma.brokerProfile.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        profile: { select: { name: true, phone: true, email: true } },
      },
    });

    return NextResponse.json({ brokers });
  } catch (error) {
    console.error("Admin brokers error:", error);
    return NextResponse.json({ error: "Failed to fetch brokers" }, { status: 500 });
  }
}
