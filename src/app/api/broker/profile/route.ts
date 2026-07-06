import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

export const dynamic = "force-dynamic";

const profileUpdateSchema = z.object({
  bio: z.string().min(10).max(500).optional(),
  serviceAreas: z.array(z.string().min(1)).min(1).max(20).optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.brokerStatus !== "APPROVED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.brokerProfile.findUnique({
      where: { profileId: session.id },
      include: {
        profile: { select: { name: true, phone: true, email: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Broker profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        name: profile.profile.name,
        phone: profile.profile.phone,
        email: profile.profile.email,
        rera: profile.rera,
        experience: profile.experience,
        city: profile.city,
        bio: profile.bio,
        serviceAreas: JSON.parse(profile.serviceAreas || "[]") as string[],
        status: profile.status,
        responseScore: profile.responseScore,
        profileCompletion: profile.profileCompletion,
        completedCollaborations: profile.completedCollaborations,
        lastActiveAt: profile.lastActiveAt?.toISOString() || null,
        rejectionReason: profile.rejectionReason,
      },
    });
  } catch (error) {
    console.error("Broker profile GET error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.brokerStatus !== "APPROVED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const existing = await prisma.brokerProfile.findUnique({ where: { profileId: session.id } });
    if (!existing) {
      return NextResponse.json({ error: "Broker profile not found" }, { status: 404 });
    }

    const serviceAreas = parsed.data.serviceAreas ?? JSON.parse(existing.serviceAreas || "[]");
    const bio = parsed.data.bio ?? existing.bio;
    let completion = 45;
    if (bio.length >= 20) completion += 15;
    if (serviceAreas.length >= 2) completion += 20;
    if (existing.rera) completion += 20;
    completion = Math.min(completion, 100);

    const updated = await prisma.brokerProfile.update({
      where: { profileId: session.id },
      data: {
        bio,
        serviceAreas: JSON.stringify(serviceAreas),
        profileCompletion: completion,
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json({
      profile: {
        bio: updated.bio,
        serviceAreas: JSON.parse(updated.serviceAreas || "[]") as string[],
        profileCompletion: updated.profileCompletion,
      },
    });
  } catch (error) {
    console.error("Broker profile PATCH error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
