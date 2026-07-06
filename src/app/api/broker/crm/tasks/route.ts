import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { brokerTaskSchema } from "@/lib/validations";
import { formatBrokerTask } from "@/server/broker-crm";

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

    const status = new URL(req.url).searchParams.get("status") || "PENDING";
    const tasks = await prisma.brokerTask.findMany({
      where: { brokerId: session.id, status },
      include: { client: { select: { id: true, name: true, phone: true } } },
      orderBy: { dueAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ tasks: tasks.map(formatBrokerTask) });
  } catch (error) {
    console.error("CRM tasks GET error:", error);
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireBroker();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = brokerTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    if (parsed.data.clientId) {
      const client = await prisma.brokerClient.findFirst({
        where: { id: parsed.data.clientId, brokerId: session.id },
      });
      if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const task = await prisma.brokerTask.create({
      data: {
        brokerId: session.id,
        clientId: parsed.data.clientId || null,
        propertyId: parsed.data.propertyId || null,
        type: parsed.data.type,
        title: parsed.data.title,
        note: parsed.data.note || null,
        dueAt: new Date(parsed.data.dueAt),
      },
      include: { client: { select: { id: true, name: true, phone: true } } },
    });

    if (parsed.data.clientId) {
      await prisma.brokerClient.update({
        where: { id: parsed.data.clientId },
        data: { nextFollowUpAt: new Date(parsed.data.dueAt) },
      });
    }

    return NextResponse.json({ task: formatBrokerTask(task) }, { status: 201 });
  } catch (error) {
    console.error("CRM tasks POST error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
