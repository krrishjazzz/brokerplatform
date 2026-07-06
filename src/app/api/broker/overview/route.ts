import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { scoreMatch } from "@/lib/workflow";
import { BROKER_VISIBLE_TYPES } from "@/lib/visibility";
import { matchesPropertyAndRequirement, countPropertiesForRequirement } from "@/server/broker-matching";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.brokerStatus !== "APPROVED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.brokerProfile.updateMany({
      where: { profileId: session.id },
      data: { lastActiveAt: new Date() },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const propertyWhere = {
      status: { notIn: ["REJECTED", "CLOSED"] as string[] },
      visibilityType: { in: BROKER_VISIBLE_TYPES },
    };

    const requirementWhere = {
      status: { in: ["ACTIVE", "MATCHING", "IN_DISCUSSION"] as string[] },
    };

    const [inventoryTotal, demandTotal, freshInventory, freshDemand, properties, requirements, collaborations, recentActivity, brokerProfile] =
      await Promise.all([
        prisma.property.count({ where: propertyWhere }),
        prisma.requirement.count({ where: requirementWhere }),
        prisma.property.count({ where: { ...propertyWhere, updatedAt: { gte: sevenDaysAgo } } }),
        prisma.requirement.count({ where: { ...requirementWhere, createdAt: { gte: sevenDaysAgo } } }),
        prisma.property.findMany({
          where: propertyWhere,
          orderBy: { updatedAt: "desc" },
          take: 40,
          select: {
            id: true,
            slug: true,
            title: true,
            city: true,
            locality: true,
            propertyType: true,
            price: true,
            updatedAt: true,
            listingStatus: true,
          },
        }),
        prisma.requirement.findMany({
          where: requirementWhere,
          orderBy: { createdAt: "desc" },
          take: 40,
          select: {
            id: true,
            description: true,
            city: true,
            locality: true,
            propertyType: true,
            budgetMin: true,
            budgetMax: true,
            createdAt: true,
            broker: { select: { id: true, name: true } },
          },
        }),
        prisma.collaboration.findMany({
          where: {
            OR: [{ initiatorId: session.id }, { recipientId: session.id }],
          },
          orderBy: { updatedAt: "desc" },
          take: 8,
          include: {
            property: { select: { id: true, title: true, slug: true, city: true } },
            requirement: { select: { id: true, description: true, city: true } },
          },
        }),
        prisma.activityEvent.findMany({
          where: { actorId: session.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            eventType: true,
            targetType: true,
            createdAt: true,
            propertyId: true,
            requirementId: true,
          },
        }),
        prisma.brokerProfile.findUnique({
          where: { profileId: session.id },
          select: {
            rera: true,
            city: true,
            serviceAreas: true,
            bio: true,
            responseScore: true,
            profileCompletion: true,
            completedCollaborations: true,
            lastActiveAt: true,
          },
        }),
      ]);

    const candidateRequirements = await prisma.requirement.findMany({
      where: requirementWhere,
      take: 120,
      select: {
        id: true,
        description: true,
        propertyType: true,
        city: true,
        locality: true,
        budgetMin: true,
        budgetMax: true,
        createdAt: true,
        broker: { select: { id: true, name: true } },
      },
    });

    const followUpProperties: Array<{
      id: string;
      title: string;
      city: string;
      matchingRequirementsCount: number;
      updatedAt: string;
    }> = [];

    let hotMatchCount = 0;
    const suggestedMatches: Array<{
      propertyId: string;
      propertyTitle: string;
      requirementId: string;
      requirementDescription: string;
      score: number;
      label: string;
      city: string;
    }> = [];

    for (const property of properties) {
      const matchable = {
        propertyType: property.propertyType,
        city: property.city,
        locality: property.locality,
        price: property.price,
      };

      let matchCount = 0;
      for (const requirement of candidateRequirements) {
        if (
          matchesPropertyAndRequirement(matchable, {
            propertyType: requirement.propertyType,
            city: requirement.city,
            locality: requirement.locality,
            budgetMin: requirement.budgetMin,
            budgetMax: requirement.budgetMax,
          })
        ) {
          matchCount += 1;
          if (suggestedMatches.length < 6) {
            const scored = scoreMatch({
              propertyCity: property.city,
              propertyLocality: property.locality,
              propertyType: property.propertyType,
              price: Number(property.price),
              requirementCity: requirement.city,
              requirementLocality: requirement.locality,
              requirementType: requirement.propertyType,
              budgetMin: requirement.budgetMin ? Number(requirement.budgetMin) : null,
              budgetMax: requirement.budgetMax ? Number(requirement.budgetMax) : null,
            });
            suggestedMatches.push({
              propertyId: property.id,
              propertyTitle: property.title,
              requirementId: requirement.id,
              requirementDescription: requirement.description,
              score: scored.score,
              label: scored.label,
              city: property.city,
            });
          }
        }
      }

      if (matchCount > 0) hotMatchCount += matchCount;
      const isStale = property.updatedAt < sevenDaysAgo;
      if (matchCount > 0 || isStale) {
        followUpProperties.push({
          id: property.id,
          title: property.title,
          city: property.city,
          matchingRequirementsCount: matchCount,
          updatedAt: property.updatedAt.toISOString(),
        });
      }
    }

    suggestedMatches.sort((a, b) => b.score - a.score);

    const candidateProperties = await prisma.property.findMany({
      where: propertyWhere,
      take: 120,
      select: {
        id: true,
        propertyType: true,
        city: true,
        locality: true,
        price: true,
      },
    });

    const matchedDemandCount = requirements.filter(
      (requirement) => countPropertiesForRequirement(requirement, candidateProperties) > 0
    ).length;

    return NextResponse.json({
      greeting: session.name?.split(" ")[0] || "Partner",
      stats: {
        inventoryTotal,
        demandTotal,
        freshInventory,
        freshDemand,
        hotMatchCount,
        followUpCount: followUpProperties.length,
        matchedDemandCount,
        activeCollaborations: collaborations.filter((c) => !["CLOSED", "LOST"].includes(c.status)).length,
      },
      navCounts: {
        inventory: inventoryTotal,
        demand: demandTotal,
        matches: hotMatchCount,
        followUps: followUpProperties.length,
      },
      followUpQueue: followUpProperties.slice(0, 5),
      suggestedMatches: suggestedMatches.slice(0, 6),
      recentCollaborations: collaborations.map((item) => ({
        id: item.id,
        status: item.status,
        lastAction: item.lastAction,
        updatedAt: item.updatedAt.toISOString(),
        property: item.property
          ? { id: item.property.id, title: item.property.title, slug: item.property.slug, city: item.property.city }
          : null,
        requirement: item.requirement
          ? { id: item.requirement.id, description: item.requirement.description, city: item.requirement.city }
          : null,
      })),
      recentActivity: recentActivity.map((item) => ({
        id: item.id,
        eventType: item.eventType,
        targetType: item.targetType,
        createdAt: item.createdAt.toISOString(),
        propertyId: item.propertyId,
        requirementId: item.requirementId,
      })),
      profile: brokerProfile
        ? {
            ...brokerProfile,
            serviceAreas: JSON.parse(brokerProfile.serviceAreas || "[]") as string[],
            lastActiveAt: brokerProfile.lastActiveAt?.toISOString() || null,
          }
        : null,
    });
  } catch (error) {
    console.error("Broker overview error:", error);
    return NextResponse.json({ error: "Failed to load overview" }, { status: 500 });
  }
}
