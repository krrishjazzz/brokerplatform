import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatBrokerClient, formatBrokerTask } from "@/server/broker-crm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.brokerStatus !== "APPROVED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(now.getDate() - 3);

    const [overdueTasks, todayTasks, hotStaleClients, stats] = await Promise.all([
      prisma.brokerTask.findMany({
        where: {
          brokerId: session.id,
          status: "PENDING",
          dueAt: { lt: startOfDay },
        },
        include: { client: { select: { id: true, name: true, phone: true } } },
        orderBy: { dueAt: "asc" },
        take: 10,
      }),
      prisma.brokerTask.findMany({
        where: {
          brokerId: session.id,
          status: "PENDING",
          dueAt: { gte: startOfDay, lte: endOfDay },
        },
        include: { client: { select: { id: true, name: true, phone: true } } },
        orderBy: { dueAt: "asc" },
        take: 15,
      }),
      prisma.brokerClient.findMany({
        where: {
          brokerId: session.id,
          seriousness: "HOT",
          stage: { notIn: ["WON", "LOST"] },
          OR: [{ lastContactAt: null }, { lastContactAt: { lt: threeDaysAgo } }],
        },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
      Promise.all([
        prisma.brokerClient.count({ where: { brokerId: session.id, stage: { notIn: ["WON", "LOST"] } } }),
        prisma.brokerTask.count({ where: { brokerId: session.id, status: "PENDING", dueAt: { lt: startOfDay } } }),
        prisma.brokerTask.count({
          where: { brokerId: session.id, status: "PENDING", dueAt: { gte: startOfDay, lte: endOfDay } },
        }),
        prisma.brokerClient.count({ where: { brokerId: session.id, stage: "NEW" } }),
      ]),
    ]);

    const [activeClients, overdueCount, dueTodayCount, newLeads] = stats;

    return NextResponse.json({
      stats: { activeClients, overdueCount, dueTodayCount, newLeads },
      overdueTasks: overdueTasks.map(formatBrokerTask),
      todayTasks: todayTasks.map(formatBrokerTask),
      hotStaleClients: hotStaleClients.map(formatBrokerClient),
    });
  } catch (error) {
    console.error("CRM today GET error:", error);
    return NextResponse.json({ error: "Failed to load today queue" }, { status: 500 });
  }
}
