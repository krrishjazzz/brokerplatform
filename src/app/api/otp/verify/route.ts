import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { validateIndianPhone } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TEST_OTP = process.env.MOCK_OTP || (process.env.NODE_ENV !== "production" ? "999999" : "");

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !validateIndianPhone(phone) || !otp) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const isTestOtp = Boolean(TEST_OTP && otp === TEST_OTP);
    const record = isTestOtp
      ? await prisma.otpRecord.findFirst({
          where: { phone, used: false },
          orderBy: { createdAt: "desc" },
        })
      : await prisma.otpRecord.findFirst({
          where: {
            phone,
            otp,
            used: false,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
        });

    if (!record && !isTestOtp) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    if (record) {
      await prisma.otpRecord.update({
        where: { id: record.id },
        data: { used: true },
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { phone },
      include: { brokerProfile: true },
    });

    if (profile) {
      await createSession(profile.id);
      return NextResponse.json({
        success: true,
        user: {
          id: profile.id,
          phone: profile.phone,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          avatarUrl: profile.avatarUrl,
          brokerStatus: profile.brokerProfile?.status,
        },
      });
    }

    // New user - store phone in a temporary way via session cookie
    // We'll create the profile on registration
    const tempProfile = await prisma.profile.create({
      data: { phone },
    });
    await createSession(tempProfile.id);

    return NextResponse.json({ success: true, isNew: true });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
