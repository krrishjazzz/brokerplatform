import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatBrokerTask } from "@/server/broker-crm";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session || session.brokerStatus !== "APPROVED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const existing = await prisma.brokerTask.findFirst({
      where: { id, brokerId: session.id },
    });
    if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const task = await prisma.brokerTask.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.title ? { title: body.title } : {}),
        ...(body.note !== undefined ? { note: body.note || null } : {}),
        ...(body.dueAt ? { dueAt: new Date(body.dueAt) } : {}),
      },
      include: { client: { select: { id: true, name: true, phone: true } } },
    });

    return NextResponse.json({ task: formatBrokerTask(task) });
  } catch (error) {
    console.error("CRM task PATCH error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
