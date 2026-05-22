export const LEAD_PIPELINE = [
  { value: "NEW", label: "New enquiry", ownerHint: "KrrishJazz has received this buyer interest." },
  { value: "CONTACTED", label: "Contacted", ownerHint: "The customer callback has been handled." },
  { value: "VISIT_SCHEDULED", label: "Visit scheduled", ownerHint: "A site visit is being coordinated." },
  { value: "NEGOTIATING", label: "Negotiating", ownerHint: "Price or terms are under discussion." },
  { value: "CLOSED", label: "Closed", ownerHint: "Deal closure completed." },
  { value: "LOST", label: "Lost", ownerHint: "This lead did not convert." },
] as const;

export type LeadStatus = (typeof LEAD_PIPELINE)[number]["value"];

export const CLOSURE_STAGES = [
  { id: "enquiry", label: "Enquiry", desc: "Buyer interest received and qualified." },
  { id: "visit", label: "Visit", desc: "Site visit coordinated by KrrishJazz." },
  { id: "negotiation", label: "Negotiation", desc: "Price and terms under discussion." },
  { id: "token", label: "Token", desc: "Token amount and timeline agreed." },
  { id: "agreement", label: "Agreement", desc: "Documentation in progress." },
  { id: "closed", label: "Closed", desc: "Deal completed — service fee applies only after successful closure." },
  { id: "lost", label: "Lost", desc: "This lead did not convert." },
] as const;

export type ClosureStageId = (typeof CLOSURE_STAGES)[number]["id"];

const CLOSURE_STAGE_INDEX: Record<ClosureStageId, number> = {
  enquiry: 0,
  visit: 1,
  negotiation: 2,
  token: 3,
  agreement: 4,
  closed: 5,
  lost: 6,
};

export function enquiryStatusToClosureStage(status?: string): ClosureStageId {
  switch (status) {
    case "NEW":
    case "CONTACTED":
      return "enquiry";
    case "VISIT_SCHEDULED":
      return "visit";
    case "NEGOTIATING":
      return "negotiation";
    case "CLOSED":
      return "closed";
    case "LOST":
      return "lost";
    default:
      return "enquiry";
  }
}

export function getHighestClosureStage(statuses: string[]): ClosureStageId {
  if (statuses.length === 0) return "enquiry";
  let highest: ClosureStageId = "enquiry";
  let maxIndex = CLOSURE_STAGE_INDEX.enquiry;
  for (const status of statuses) {
    const stage = enquiryStatusToClosureStage(status);
    const index = CLOSURE_STAGE_INDEX[stage];
    if (index > maxIndex) {
      maxIndex = index;
      highest = stage;
    }
  }
  return highest;
}

export function leadStatusLabel(status?: string) {
  return LEAD_PIPELINE.find((item) => item.value === status)?.label || (status || "NEW").replaceAll("_", " ");
}

export function leadStatusHint(status?: string) {
  return LEAD_PIPELINE.find((item) => item.value === status)?.ownerHint || "KrrishJazz is tracking this enquiry.";
}

export function leadStatusVariant(status?: string) {
  if (status === "NEW") return "warning";
  if (status === "CONTACTED" || status === "VISIT_SCHEDULED" || status === "NEGOTIATING" || status === "CLOSED") return "success";
  if (status === "LOST") return "error";
  return "default";
}
