import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { brokerClientSchema } from "@/lib/validations";
import { formatBrokerClient, normalizeClientPhone } from "@/server/broker-crm";

export const dynamic = "force-dynamic";

async function requireBroker() {
  const session = await getSession();
  if (!session || session.brokerStatus !== "APPROVED") return null;
  return session;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireBroker();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");
    const q = searchParams.get("q");
    const seriousness = searchParams.get("seriousness");

    const clients = await prisma.brokerClient.findMany({
      where: {
        brokerId: session.id,
        ...(stage ? { stage } : {}),
        ...(seriousness ? { seriousness } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { phone: { contains: q } },
                { city: { contains: q, mode: "insensitive" } },
                { notes: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ nextFollowUpAt: "asc" }, { updatedAt: "desc" }],
      take: 200,
    });

    return NextResponse.json({ clients: clients.map(formatBrokerClient) });
  } catch (error) {
    console.error("CRM clients GET error:", error);
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireBroker();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = brokerClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const phone = normalizeClientPhone(parsed.data.phone);
    const existing = await prisma.brokerClient.findUnique({
      where: { brokerId_phone: { brokerId: session.id, phone } },
    });
    if (existing) {
      return NextResponse.json({ error: "A client with this phone already exists" }, { status: 409 });
    }

    const client = await prisma.brokerClient.create({
      data: {
        brokerId: session.id,
        name: parsed.data.name,
        phone,
        altPhone: parsed.data.altPhone ? normalizeClientPhone(parsed.data.altPhone) : null,
        email: parsed.data.email || null,
        intent: parsed.data.intent,
        city: parsed.data.city || "",
        localities: JSON.stringify(parsed.data.localities || []),
        propertyTypes: JSON.stringify(parsed.data.propertyTypes || []),
        budgetMin: parsed.data.budgetMin ?? null,
        budgetMax: parsed.data.budgetMax ?? null,
        bhk: parsed.data.bhk ?? null,
        stage: parsed.data.stage,
        seriousness: parsed.data.seriousness,
        source: parsed.data.source,
        notes: parsed.data.notes || "",
        shortlistedIds: JSON.stringify(parsed.data.shortlistedIds || []),
        nextFollowUpAt: parsed.data.nextFollowUpAt ? new Date(parsed.data.nextFollowUpAt) : null,
        enquiryId: parsed.data.enquiryId || null,
      },
    });

    if (parsed.data.nextFollowUpAt) {
      await prisma.brokerTask.create({
        data: {
          brokerId: session.id,
          clientId: client.id,
          type: "REMIND",
          title: `Follow up with ${parsed.data.name}`,
          dueAt: new Date(parsed.data.nextFollowUpAt),
        },
      });
    }

    return NextResponse.json({ client: formatBrokerClient(client) }, { status: 201 });
  } catch (error) {
    console.error("CRM clients POST error:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
