import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, getSession } from "@/lib/session";
import { brokerApplicationSchema } from "@/lib/validations";
import { sendSMS, SMS_TEMPLATES } from "@/lib/twilio";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = brokerApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    // Update role and create broker profile
    await prisma.$transaction([
      prisma.profile.update({
        where: { id: session.id },
        data: { role: "BROKER" },
      }),
      prisma.brokerProfile.create({
        data: {
          profileId: session.id,
          ...parsed.data,
          status: "PENDING",
        },
      }),
    ]);

    await createSession(session.id);

    // Notify admin
    const adminPhone = process.env.ADMIN_PHONE;
    if (adminPhone) {
      await sendSMS(adminPhone, SMS_TEMPLATES.brokerApplied(session.name || session.phone));
    }

    return NextResponse.json({ success: true, message: "Application submitted" }, { status: 201 });
  } catch (error) {
    console.error("Broker apply error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
