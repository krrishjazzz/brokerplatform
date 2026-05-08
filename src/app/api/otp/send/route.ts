import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSMS, SMS_TEMPLATES } from "@/lib/twilio";
import { generateOTP, validateIndianPhone } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

const TEST_OTP = process.env.MOCK_OTP || (process.env.NODE_ENV !== "production" ? "999999" : "");

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !validateIndianPhone(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    if (!TEST_OTP && !rateLimit(`otp:${phone}`, 3, 3600000)) {
      return NextResponse.json({ error: "Too many OTP requests. Try again later." }, { status: 429 });
    }

    const otp = TEST_OTP || generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const record = await prisma.otpRecord.create({
      data: { phone, otp, expiresAt },
    });

    if (TEST_OTP) {
      return NextResponse.json({
        success: true,
        message: "Test OTP ready",
      });
    }

    const result = await sendSMS(phone, SMS_TEMPLATES.otp(otp));
    if (!result.success) {
      await prisma.otpRecord.delete({ where: { id: record.id } }).catch(() => {});
      return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
