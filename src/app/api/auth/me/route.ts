import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: session });
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, wantToListAsOwner } = body;
    const shouldEnableListing =
      wantToListAsOwner === true && !session.canList && session.role !== "ADMIN";

    const updated = await prisma.profile.update({
      where: { id: session.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(shouldEnableListing && { canList: true }),
      },
    });

    if (name || email || shouldEnableListing) {
      await createSession(updated.id);
    }

    const sessionUser = await getSession();
    return NextResponse.json({ profile: updated, user: sessionUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
