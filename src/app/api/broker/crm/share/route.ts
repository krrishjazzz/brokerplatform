import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { brokerShareSchema } from "@/lib/validations";
import { buildClientPropertyWhatsAppMessage } from "@/server/crm-messaging";
import { formatBrokerShare } from "@/server/broker-crm";
import { parseJsonArray } from "@/server/json";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.brokerStatus !== "APPROVED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = brokerShareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const client = await prisma.brokerClient.findFirst({
      where: { id: parsed.data.clientId, brokerId: session.id },
    });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const properties = await prisma.property.findMany({
      where: { id: { in: parsed.data.propertyIds } },
    });
    if (properties.length === 0) {
      return NextResponse.json({ error: "No valid properties found" }, { status: 400 });
    }

    const brokerProfile = await prisma.brokerProfile.findUnique({
      where: { profileId: session.id },
      include: { profile: { select: { name: true } } },
    });

    const messageBody =
      parsed.data.customMessage ||
      buildClientPropertyWhatsAppMessage({
        clientName: client.name,
        brokerName: brokerProfile?.profile.name || session.name || "Your broker",
        rera: brokerProfile?.rera,
        properties: properties.map((property) => ({
          title: property.title,
          city: property.city,
          locality: property.locality,
          propertyType: property.propertyType,
          price: Number(property.price),
          area: property.area,
          areaUnit: property.areaUnit,
          slug: property.slug,
        })),
        origin: req.nextUrl.origin,
      });

    const phone = client.phone.replace(/^\+/, "");
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageBody)}`;

    const share = await prisma.brokerLeadShare.create({
      data: {
        brokerId: session.id,
        clientId: client.id,
        propertyId: properties[0]?.id || null,
        propertyIds: JSON.stringify(parsed.data.propertyIds),
        messageBody,
        templateKey: parsed.data.templateKey || "PROPERTY_OPTIONS",
        channel: "WHATSAPP",
      },
    });

    const shortlisted = new Set([...parseJsonArray(client.shortlistedIds), ...parsed.data.propertyIds]);

    await prisma.brokerClient.update({
      where: { id: client.id },
      data: {
        shortlistedIds: JSON.stringify(Array.from(shortlisted)),
        lastContactAt: new Date(),
        stage: client.stage === "NEW" ? "CONTACTED" : client.stage,
      },
    });

    return NextResponse.json({
      share: formatBrokerShare(share),
      whatsappUrl,
      messageBody,
    });
  } catch (error) {
    console.error("CRM share POST error:", error);
    return NextResponse.json({ error: "Failed to prepare WhatsApp share" }, { status: 500 });
  }
}
