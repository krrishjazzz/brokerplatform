import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { parseJsonArray, parseJsonObject } from "@/server/json";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true,
            brokerProfile: {
              select: {
                rera: true,
                city: true,
                serviceAreas: true,
                responseScore: true,
                completedCollaborations: true,
                profileCompletion: true,
                lastActiveAt: true,
              },
            },
          },
        },
        assignedBroker: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            brokerProfile: {
              select: {
                rera: true,
                city: true,
                serviceAreas: true,
                responseScore: true,
                completedCollaborations: true,
                profileCompletion: true,
                lastActiveAt: true,
              },
            },
          },
        },
        freshnessHistory: {
          orderBy: { confirmedAt: "desc" },
          take: 10,
          include: { confirmedBy: { select: { name: true, phone: true, role: true } } },
        },
        enquiries: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { customer: { select: { name: true, phone: true, email: true, role: true } } },
        },
        collaborations: {
          orderBy: { updatedAt: "desc" },
          take: 10,
          include: {
            requirement: {
              select: {
                id: true,
                description: true,
                propertyType: true,
                locality: true,
                city: true,
                budgetMin: true,
                budgetMax: true,
                urgency: true,
                status: true,
              },
            },
            initiator: { select: { name: true, phone: true, role: true } },
            recipient: { select: { name: true, phone: true, role: true } },
          },
        },
        _count: {
          select: {
            enquiries: true,
            saved: true,
            collaborations: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const activity = await prisma.activityEvent.findMany({
      where: {
        OR: [
          { propertyId: property.id },
          { targetType: "PROPERTY", targetId: property.id },
          { targetType: "Property", targetId: property.id },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { actor: { select: { name: true, phone: true, role: true } } },
    });

    return NextResponse.json({
      property: {
        ...property,
        price: Number(property.price),
        amenities: parseJsonArray(property.amenities),
        images: parseJsonArray(property.images),
        enquiries: property.enquiries.map((enquiry) => ({
          ...enquiry,
          createdAt: enquiry.createdAt.toISOString(),
          visitDate: enquiry.visitDate?.toISOString() || null,
        })),
        collaborations: property.collaborations.map((collaboration) => ({
          ...collaboration,
          createdAt: collaboration.createdAt.toISOString(),
          updatedAt: collaboration.updatedAt.toISOString(),
          requirement: collaboration.requirement
            ? {
                ...collaboration.requirement,
                budgetMin: collaboration.requirement.budgetMin ? Number(collaboration.requirement.budgetMin) : null,
                budgetMax: collaboration.requirement.budgetMax ? Number(collaboration.requirement.budgetMax) : null,
              }
            : null,
        })),
        activity: activity.map((event) => ({
          ...event,
          metadata: parseJsonObject(event.metadata),
          createdAt: event.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Admin property detail error:", error);
    return NextResponse.json({ error: "Failed to load property operations detail" }, { status: 500 });
  }
}
