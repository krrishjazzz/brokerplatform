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

    const broker = await prisma.brokerProfile.update({
      where: { id: params.id },
      data: { status: "APPROVED" },
      include: { profile: true },
    });

    await sendSMS(broker.profile.phone, SMS_TEMPLATES.brokerApproved(broker.profile.name || ""));

    return NextResponse.json({ broker });
  } catch (error) {
    console.error("Broker approve error:", error);
    return NextResponse.json({ error: "Failed to approve broker" }, { status: 500 });
  }
}
