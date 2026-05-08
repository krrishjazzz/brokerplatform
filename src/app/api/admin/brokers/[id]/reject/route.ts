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

    const broker = await prisma.brokerProfile.update({
      where: { id: params.id },
      data: { status: "REJECTED", rejectionReason: reason || "Application not approved" },
      include: { profile: true },
    });

    await sendSMS(
      broker.profile.phone,
      SMS_TEMPLATES.brokerRejected(broker.profile.name || "", reason || "Application not approved")
    );

    return NextResponse.json({ broker });
  } catch (error) {
    console.error("Broker reject error:", error);
    return NextResponse.json({ error: "Failed to reject broker" }, { status: 500 });
  }
}
