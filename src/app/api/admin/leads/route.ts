import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const leads = await prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { title: true, slug: true } },
        customer: { select: { name: true } },
      },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Admin leads error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
