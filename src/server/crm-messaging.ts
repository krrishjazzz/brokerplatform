import { formatPrice } from "@/lib/utils";

type ShareProperty = {
  title: string;
  city: string;
  locality: string;
  propertyType: string;
  price: number;
  area: number;
  areaUnit: string;
  slug: string;
};

export function buildClientPropertyWhatsAppMessage(input: {
  clientName: string;
  brokerName: string;
  rera?: string;
  properties: ShareProperty[];
  origin: string;
}) {
  const lines = [
    `Hi ${input.clientName},`,
    "",
    "Sharing property options as discussed:",
    "",
  ];

  input.properties.slice(0, 5).forEach((property, index) => {
    lines.push(
      `${index + 1}) ${property.title}`,
      `   ${property.propertyType} · ${property.locality ? `${property.locality}, ` : ""}${property.city}`,
      `   ${formatPrice(property.price)} · ${Math.round(property.area).toLocaleString()} ${property.areaUnit}`,
      `   ${input.origin}/properties/${property.slug}`,
      ""
    );
  });

  lines.push("Let me know a suitable time for site visit.", "");
  lines.push(`— ${input.brokerName}`);
  if (input.rera) lines.push(`RERA: ${input.rera}`);

  return lines.join("\n");
}

export function buildClientFollowUpMessage(input: {
  clientName: string;
  brokerName: string;
}) {
  return [
    `Hi ${input.clientName},`,
    "",
    "Just checking in — are you still exploring properties in your preferred area?",
    "Happy to share fresh options or schedule a visit.",
    "",
    `— ${input.brokerName}`,
  ].join("\n");
}
