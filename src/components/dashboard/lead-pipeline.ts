export const LEAD_PIPELINE = [
  { value: "NEW", label: "New enquiry", ownerHint: "KrrishJazz has received this buyer interest." },
  { value: "CONTACTED", label: "Contacted", ownerHint: "The customer callback has been handled." },
  { value: "VISIT_SCHEDULED", label: "Visit scheduled", ownerHint: "A site visit is being coordinated." },
  { value: "NEGOTIATING", label: "Negotiating", ownerHint: "Price or terms are under discussion." },
  { value: "CLOSED", label: "Closed", ownerHint: "Deal closure completed." },
  { value: "LOST", label: "Lost", ownerHint: "This lead did not convert." },
] as const;

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
