import { postJson } from "@/shared/api/client";

export type BrokerActionPayload = {
  propertyId?: string;
  requirementId?: string | null;
  recipientId?: string | null;
  eventType: string;
  status?: string;
  source?: string;
  metadata?: Record<string, unknown>;
};

export type BrokerActionHandler = (payload: BrokerActionPayload | Record<string, unknown>) => void;

export async function trackBrokerAction(payload: BrokerActionPayload) {
  await postJson("/api/broker/collaborations", payload).catch(() => {});
}
