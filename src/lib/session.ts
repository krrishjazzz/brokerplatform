import { cookies } from "next/headers";
import { prisma } from "./prisma";
import * as jose from "jose";
import { profileCanList, profileCanPostProperty, type OwnerListingStatus } from "@/lib/capabilities";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "krishjazz-secret-key-change-in-production"
);

export type SessionUser = {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: string;
  avatarUrl: string | null;
  brokerStatus: string | null;
  hasBrokerApplication: boolean;
  canList: boolean;
  canPostProperty: boolean;
  ownerStatus: OwnerListingStatus;
  permissionsVersion: number;
  brokerApplicationAt: string | null;
  brokerRejectionReason: string | null;
};

export async function createSession(profileId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: {
      role: true,
      canList: true,
      ownerStatus: true,
      permissionsVersion: true,
      brokerProfile: { select: { status: true } },
    },
  });

  const role = profile?.role || "CUSTOMER";
  const brokerStatus = profile?.brokerProfile?.status || null;
  const canList = profile ? profileCanList(profile) : false;
  const canPostProperty = profile ? profileCanPostProperty(profile) : false;
  const ownerStatus = (profile?.ownerStatus || "NONE") as OwnerListingStatus;
  const permissionsVersion = profile?.permissionsVersion ?? 0;

  const token = await new jose.SignJWT({
    profileId,
    role,
    brokerStatus,
    canList,
    canPostProperty,
    ownerStatus,
    permissionsVersion,
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

export async function getSession(): Promise<SessionUser | null> {
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

    const brokerStatus = profile.brokerProfile?.status ?? null;
    const hasBrokerApplication = Boolean(brokerStatus);
    const canList = profileCanList(profile);
    const canPostProperty = profileCanPostProperty(profile);

    return {
      id: profile.id,
      phone: profile.phone,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatarUrl: profile.avatarUrl,
      brokerStatus,
      hasBrokerApplication,
      canList,
      canPostProperty,
      ownerStatus: (profile.ownerStatus || "NONE") as OwnerListingStatus,
      permissionsVersion: profile.permissionsVersion ?? 0,
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
