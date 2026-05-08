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

    const { reason } = await req.json();

    const property = await prisma.property.update({
      where: { id: params.id },
      data: { status: "REJECTED", listingStatus: "REJECTED", rejectionReason: reason || "Does not meet guidelines" },
      include: { postedBy: true },
    });

    await sendSMS(
      property.postedBy.phone,
      SMS_TEMPLATES.propertyRejected(property.title, reason || "Does not meet guidelines")
    );

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Reject error:", error);
    return NextResponse.json({ error: "Failed to reject" }, { status: 500 });
  }
}
