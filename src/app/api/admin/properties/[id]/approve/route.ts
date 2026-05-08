import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendSMS, SMS_TEMPLATES } from "@/lib/twilio";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const property = await prisma.property.update({
      where: { id: params.id },
      data: { status: "LIVE", listingStatus: "LIVE" },
      include: { postedBy: true },
    });

    await sendSMS(property.postedBy.phone, SMS_TEMPLATES.propertyApproved(property.title));

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
  }
}
