import { cookies } from "next/headers";
import { prisma } from "./prisma";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "krishjazz-secret-key-change-in-production"
);

export async function createSession(profileId: string) {
  // Lookup profile role to embed in JWT for middleware checks
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { role: true, brokerProfile: { select: { status: true } } },
  });

  const token = await new jose.SignJWT({
    profileId,
    role: profile?.role || "CUSTOMER",
    brokerStatus: profile?.brokerProfile?.status || null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  (await cookies()).set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const profileId = payload.profileId as string;

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { brokerProfile: true },
    });

    if (!profile || !profile.isActive) return null;

    return {
      id: profile.id,
      phone: profile.phone,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatarUrl: profile.avatarUrl,
      brokerStatus: profile.brokerProfile?.status,
      brokerApplicationAt: profile.brokerProfile?.createdAt
        ? profile.brokerProfile.createdAt.toISOString()
        : null,
      brokerRejectionReason: profile.brokerProfile?.rejectionReason ?? null,
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete("session");
}
