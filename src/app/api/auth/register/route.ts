import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, getSession } from "@/lib/session";
import { registerSchema } from "@/lib/validations";
import { profileNeedsCompletion } from "@/lib/capabilities";

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

    const enableListing = wantToListAsOwner && !existing.canList;

    const profile = await prisma.profile.update({
      where: { id: session.id },
      data: {
        name,
        email: email || null,
        ...(enableListing && {
          canList: true,
          ownerStatus: "PENDING",
          permissionsVersion: { increment: 1 },
        }),
        ...(!enableListing && existing.canList && { canList: true }),
      },
      include: { brokerProfile: true },
    });

    await createSession(profile.id);

    const sessionUser = await getSession();

    return NextResponse.json({
      user: sessionUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
