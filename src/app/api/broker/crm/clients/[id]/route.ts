import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { brokerClientUpdateSchema } from "@/lib/validations";
import { formatBrokerClient, formatBrokerShare, normalizeClientPhone } from "@/server/broker-crm";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function requireBroker() {
  const session = await getSession();
  if (!session || session.brokerStatus !== "APPROVED") return null;
  return session;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const session = await requireBroker();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const client = await prisma.brokerClient.findFirst({
      where: { id, brokerId: session.id },
    });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const [shares, tasks] = await Promise.all([
      prisma.brokerLeadShare.findMany({
        where: { clientId: id, brokerId: session.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.brokerTask.findMany({
        where: { clientId: id, brokerId: session.id },
        orderBy: { dueAt: "desc" },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      client: formatBrokerClient(client),
      shares: shares.map(formatBrokerShare),
      tasks: tasks.map((task) => ({
        id: task.id,
        type: task.type,
        title: task.title,
        note: task.note,
        dueAt: task.dueAt.toISOString(),
        status: task.status,
      })),
    });
  } catch (error) {
    console.error("CRM client GET error:", error);
    return NextResponse.json({ error: "Failed to load client" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await requireBroker();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const existing = await prisma.brokerClient.findFirst({
      where: { id, brokerId: session.id },
    });
    if (!existing) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const body = await req.json();
    const parsed = brokerClientUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parsed.data;
    let phone = existing.phone;
    if (data.phone) {
      phone = normalizeClientPhone(data.phone);
      const duplicate = await prisma.brokerClient.findFirst({
        where: { brokerId: session.id, phone, NOT: { id } },
      });
      if (duplicate) {
        return NextResponse.json({ error: "Another client uses this phone" }, { status: 409 });
      }
    }

    const client = await prisma.brokerClient.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.phone !== undefined ? { phone } : {}),
        ...(data.altPhone !== undefined
          ? { altPhone: data.altPhone ? normalizeClientPhone(data.altPhone) : null }
          : {}),
        ...(data.email !== undefined ? { email: data.email || null } : {}),
        ...(data.intent !== undefined ? { intent: data.intent } : {}),
        ...(data.city !== undefined ? { city: data.city || "" } : {}),
        ...(data.localities !== undefined ? { localities: JSON.stringify(data.localities) } : {}),
        ...(data.propertyTypes !== undefined ? { propertyTypes: JSON.stringify(data.propertyTypes) } : {}),
        ...(data.budgetMin !== undefined ? { budgetMin: data.budgetMin ?? null } : {}),
        ...(data.budgetMax !== undefined ? { budgetMax: data.budgetMax ?? null } : {}),
        ...(data.bhk !== undefined ? { bhk: data.bhk ?? null } : {}),
        ...(data.stage !== undefined ? { stage: data.stage } : {}),
        ...(data.seriousness !== undefined ? { seriousness: data.seriousness } : {}),
        ...(data.source !== undefined ? { source: data.source } : {}),
        ...(data.notes !== undefined ? { notes: data.notes || "" } : {}),
        ...(data.shortlistedIds !== undefined ? { shortlistedIds: JSON.stringify(data.shortlistedIds) } : {}),
        ...(data.nextFollowUpAt !== undefined
          ? { nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null }
          : {}),
        ...(data.stage && ["CONTACTED", "VISIT_SCHEDULED", "NEGOTIATION"].includes(data.stage)
          ? { lastContactAt: new Date() }
          : {}),
      },
    });

    return NextResponse.json({ client: formatBrokerClient(client) });
  } catch (error) {
    console.error("CRM client PATCH error:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const session = await requireBroker();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const existing = await prisma.brokerClient.findFirst({
      where: { id, brokerId: session.id },
    });
    if (!existing) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    await prisma.brokerClient.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CRM client DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
