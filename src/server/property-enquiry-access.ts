import type { Property } from "@prisma/client";
import type { getSession } from "@/lib/session";

type PropertyForEnquiry = Pick<Property, "status" | "postedById" | "assignedBrokerId">;
type SessionUser = Awaited<ReturnType<typeof getSession>>;

export function canSubmitEnquiry(property: PropertyForEnquiry, session: SessionUser): boolean {
  if (property.status === "LIVE") return true;
  if (!session) return false;
  if (session.role === "ADMIN") return true;
  if (session.id === property.postedById) return true;
  if (property.assignedBrokerId && session.id === property.assignedBrokerId) return true;
  return false;
}
