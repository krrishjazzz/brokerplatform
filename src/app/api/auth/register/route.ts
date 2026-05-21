import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, getSession } from "@/lib/session";
import { registerSchema } from "@/lib/validations";
import { profileCanList, profileNeedsCompletion } from "@/lib/capabilities";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, wantToListAsOwner } = parsed.data;

    const existing = await prisma.profile.findUnique({
      where: { id: session.id },
      include: { brokerProfile: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profileNeedsCompletion(existing.name) && existing.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Profile already completed. Update from your dashboard." },
        { status: 400 }
      );
    }

    const profile = await prisma.profile.update({
      where: { id: session.id },
      data: {
        name,
        email: email || null,
        canList: existing.canList || wantToListAsOwner,
      },
      include: { brokerProfile: true },
    });

    await createSession(profile.id);

    const brokerStatus = profile.brokerProfile?.status ?? null;

    return NextResponse.json({
      user: {
        id: profile.id,
        phone: profile.phone,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatarUrl: profile.avatarUrl,
        brokerStatus,
        hasBrokerApplication: Boolean(brokerStatus),
        canList: profileCanList(profile),
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
