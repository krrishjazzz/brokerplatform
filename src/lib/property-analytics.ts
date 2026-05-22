import { prisma } from "@/lib/prisma";

export type PropertyMetricEvent = "VIEW" | "SEARCH_IMPRESSION" | "CLICK" | "SAVE";

function startOfUtcDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function recordPropertyMetric(propertyId: string, event: PropertyMetricEvent) {
  const day = startOfUtcDay();

  const propertyUpdate: Record<string, { increment: number }> = {};
  const dailyUpdate: Record<string, { increment: number }> = {};

  switch (event) {
    case "VIEW":
      propertyUpdate.viewCount = { increment: 1 };
      dailyUpdate.views = { increment: 1 };
      break;
    case "SEARCH_IMPRESSION":
      propertyUpdate.searchImpressionCount = { increment: 1 };
      dailyUpdate.searchImpressions = { increment: 1 };
      break;
    case "CLICK":
      propertyUpdate.clickCount = { increment: 1 };
      dailyUpdate.clicks = { increment: 1 };
      break;
    case "SAVE":
      dailyUpdate.saves = { increment: 1 };
      break;
    default:
      return;
  }

  await prisma.$transaction([
    prisma.property.update({
      where: { id: propertyId },
      data: propertyUpdate,
    }),
    prisma.propertyMetricDaily.upsert({
      where: {
        propertyId_day: { propertyId, day },
      },
      create: {
        propertyId,
        day,
        views: event === "VIEW" ? 1 : 0,
        searchImpressions: event === "SEARCH_IMPRESSION" ? 1 : 0,
        clicks: event === "CLICK" ? 1 : 0,
        saves: event === "SAVE" ? 1 : 0,
      },
      update: dailyUpdate,
    }),
  ]);
}

export async function recordPropertyEnquiryMetric(propertyId: string, hasVisitDate: boolean) {
  const day = startOfUtcDay();
  await prisma.$transaction([
    prisma.property.update({
      where: { id: propertyId },
      data: {
        enquiryCount: { increment: 1 },
        ...(hasVisitDate ? { visitCount: { increment: 1 } } : {}),
      },
    }),
    prisma.propertyMetricDaily.upsert({
      where: { propertyId_day: { propertyId, day } },
      create: {
        propertyId,
        day,
        enquiries: 1,
        visits: hasVisitDate ? 1 : 0,
      },
      update: {
        enquiries: { increment: 1 },
        ...(hasVisitDate ? { visits: { increment: 1 } } : {}),
      },
    }),
  ]);
}

export async function getOwnerAnalyticsSummary(postedById: string, days = 7) {
  const since = startOfUtcDay();
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const properties = await prisma.property.findMany({
    where: { postedById },
    select: {
      id: true,
      viewCount: true,
      searchImpressionCount: true,
      clickCount: true,
      enquiryCount: true,
      visitCount: true,
      listingQualityScore: true,
    },
  });

  const propertyIds = properties.map((p) => p.id);
  if (propertyIds.length === 0) {
    return {
      views7d: 0,
      searchImpressions7d: 0,
      clicks7d: 0,
      saves7d: 0,
      enquiries7d: 0,
      visits7d: 0,
      viewToEnquiryRate: 0,
      viewToVisitRate: 0,
      avgQualityScore: 0,
    };
  }

  const daily = await prisma.propertyMetricDaily.groupBy({
    by: ["propertyId"],
    where: {
      propertyId: { in: propertyIds },
      day: { gte: since },
    },
    _sum: {
      views: true,
      searchImpressions: true,
      clicks: true,
      saves: true,
      enquiries: true,
      visits: true,
    },
  });

  const totals = daily.reduce(
    (acc, row) => ({
      views7d: acc.views7d + (row._sum.views ?? 0),
      searchImpressions7d: acc.searchImpressions7d + (row._sum.searchImpressions ?? 0),
      clicks7d: acc.clicks7d + (row._sum.clicks ?? 0),
      saves7d: acc.saves7d + (row._sum.saves ?? 0),
      enquiries7d: acc.enquiries7d + (row._sum.enquiries ?? 0),
      visits7d: acc.visits7d + (row._sum.visits ?? 0),
    }),
    {
      views7d: 0,
      searchImpressions7d: 0,
      clicks7d: 0,
      saves7d: 0,
      enquiries7d: 0,
      visits7d: 0,
    }
  );

  const views7d = totals.views7d;
  const enquiries7d = totals.enquiries7d;
  const visits7d = totals.visits7d;

  const avgQualityScore =
    properties.length > 0
      ? Math.round(
          properties.reduce((s, p) => s + (p.listingQualityScore ?? 0), 0) / properties.length
        )
      : 0;

  return {
    ...totals,
    views7d,
    viewToEnquiryRate: views7d > 0 ? Math.round((enquiries7d / views7d) * 1000) / 10 : 0,
    viewToVisitRate: views7d > 0 ? Math.round((visits7d / views7d) * 1000) / 10 : 0,
    avgQualityScore,
  };
}
