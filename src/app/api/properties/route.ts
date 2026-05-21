import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { propertySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { sendSMS, SMS_TEMPLATES } from "@/lib/twilio";
import { logActivity } from "@/lib/workflow";
import { CUSTOMER_VISIBLE_TYPES } from "@/lib/visibility";
import { getPagination } from "@/server/pagination";
import { parseOptionalPrice } from "@/server/parse-query-filters";
import { formatProperty } from "@/server/public-property";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPagination(searchParams);

    const where: any = {};
    let publicView = true;

    // Handle postedBy=me for dashboard "My Properties"
    const postedBy = searchParams.get("postedBy");
    if (postedBy === "me") {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      where.postedById = session.id;
      publicView = false;
    } else {
      const statusParam = searchParams.get("status");
      const allStatuses = searchParams.get("allStatuses");

      if (statusParam || allStatuses) {
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (statusParam) where.status = statusParam;
        publicView = false;
      } else {
        where.status = "LIVE";
        where.visibilityType = { in: CUSTOMER_VISIBLE_TYPES };
      }
    }

    const listingType = searchParams.get("listingType");
    if (listingType) where.listingType = listingType as any;

    const category = searchParams.get("category");
    if (category) where.category = category as any;

    const propertyTypes = searchParams.getAll("propertyType").filter(Boolean);
    if (propertyTypes.length === 1) where.propertyType = propertyTypes[0];
    else if (propertyTypes.length > 1) where.propertyType = { in: propertyTypes };

    const city = searchParams.get("city");
    if (city) where.city = { contains: city };

    const locality = searchParams.get("locality");
    if (locality) where.locality = { contains: locality };

    const constructionStatus = searchParams.get("constructionStatus");
    const possession = searchParams.get("possession");
    const availableFrom = searchParams.get("availableFrom");
    const legacyAvailability = searchParams.get("availability");
    const legacyListingStatus = searchParams.get("listingStatus");

    const readyToVisit = searchParams.get("readyToVisit");
    if (readyToVisit === "true" || constructionStatus === "READY_TO_MOVE") {
      where.status = "LIVE";
      where.listingStatus = { in: ["LIVE", "AVAILABLE"] };
    }

    const validListingStatuses = new Set(["AVAILABLE", "LIVE", "PENDING"]);
    const statusCandidate = possession || legacyListingStatus;
    if (statusCandidate && validListingStatuses.has(statusCandidate)) {
      where.listingStatus = statusCandidate;
    }

    const qParts: string[] = [];
    const q = searchParams.get("q");
    if (q) qParts.push(q);
    if (constructionStatus === "NEW_LAUNCH") qParts.push("new launch");
    if (constructionStatus === "UNDER_CONSTRUCTION") qParts.push("under construction");
    if (legacyAvailability === "NEW_LAUNCH") qParts.push("new launch");
    if (legacyAvailability === "UNDER_CONSTRUCTION") qParts.push("under construction");
    if (availableFrom) qParts.push(availableFrom.replaceAll("_", " ").toLowerCase());

    const projectOptionIds = searchParams.getAll("pto").filter(Boolean);
    if (projectOptionIds.length > 0 && !q) {
      qParts.push("project");
    }

    const fresh = searchParams.get("fresh");
    if (fresh === "true") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      where.updatedAt = { gte: sevenDaysAgo };
    }

    const minPriceRaw = searchParams.get("minPrice");
    const maxPriceRaw = searchParams.get("maxPrice");
    const minPrice = parseOptionalPrice(minPriceRaw, "minPrice");
    if (!minPrice.ok) {
      return NextResponse.json({ error: minPrice.error }, { status: 400 });
    }
    const maxPrice = parseOptionalPrice(maxPriceRaw, "maxPrice");
    if (!maxPrice.ok) {
      return NextResponse.json({ error: maxPrice.error }, { status: 400 });
    }
    if (minPrice.value !== undefined || maxPrice.value !== undefined) {
      where.price = {};
      if (minPrice.value !== undefined) (where.price as { gte?: number }).gte = minPrice.value;
      if (maxPrice.value !== undefined) (where.price as { lte?: number }).lte = maxPrice.value;
    }

    const bedrooms = searchParams.get("bedrooms");
    if (bedrooms) {
      const bedroomCount = Number.parseInt(bedrooms, 10);
      if (Number.isFinite(bedroomCount) && bedroomCount > 0) where.bedrooms = bedroomCount;
    }

    const furnishing = searchParams.get("furnishing");
    if (furnishing) where.furnishing = furnishing;

    const mergedQ = qParts.filter(Boolean).join(" ").trim();
    if (mergedQ) {
      where.OR = [
        { title: { contains: mergedQ } },
        { description: { contains: mergedQ } },
        { city: { contains: mergedQ } },
        { locality: { contains: mergedQ } },
        { address: { contains: mergedQ } },
      ];
    }

    const sort = searchParams.get("sort");
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          postedBy: { select: { name: true, role: true } },
          assignedBroker: { select: { name: true, role: true } },
          freshnessHistory: { orderBy: { confirmedAt: "desc" }, take: 1 },
          _count: publicView ? undefined : { select: { enquiries: true } },
        },
      }),
      prisma.property.count({ where }),
    ]);

    const processedProperties = properties.map(property => formatProperty(property, { publicView }));

    return NextResponse.json({
      properties: processedProperties,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Properties fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.canList && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Only owners and approved brokers can post properties" }, { status: 403 });
    }

    if (
      session.brokerStatus &&
      session.brokerStatus !== "APPROVED" &&
      !session.canList
    ) {
      return NextResponse.json({ error: "Broker account not yet approved" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = propertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const slug = slugify(parsed.data.title) + "-" + nanoid(6);

    const {
      amenities,
      images,
      assignedBrokerId,
      publicBrokerName,
      visibilityType,
      coverImage,
      ...propertyData
    } = parsed.data;
    const normalizedVisibilityType = visibilityType === "PUBLIC_TO_CUSTOMERS" ? "FULL_VISIBILITY" : visibilityType;

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        price: propertyData.price,
        slug,
        postedById: session.id,
        assignedBrokerId:
          session.role === "ADMIN" && assignedBrokerId
            ? assignedBrokerId
            : session.brokerStatus === "APPROVED"
              ? session.id
              : null,
        visibilityType: normalizedVisibilityType,
        listingStatus: "PENDING",
        publicBrokerName: publicBrokerName || "KrrishJazz",
        status: "PENDING_REVIEW",
        amenities: JSON.stringify(amenities),
        images: JSON.stringify(images),
        coverImage: coverImage || images[0] || null,
      },
    });

    const freshnessExpiry = new Date();
    freshnessExpiry.setDate(freshnessExpiry.getDate() + 14);
    await prisma.listingFreshness.create({
      data: {
        propertyId: property.id,
        confirmedById: session.id,
        availabilityStatus: "PENDING",
        expiresAt: freshnessExpiry,
        note: "Created with property submission",
      },
    });

    await logActivity({
      actorId: session.id,
      eventType: "PROPERTY_SUBMITTED",
      targetType: "PROPERTY",
      targetId: property.id,
      propertyId: property.id,
      metadata: { visibilityType: normalizedVisibilityType, locality: property.locality, city: property.city },
    });

    await sendSMS(session.phone, SMS_TEMPLATES.propertySubmitted());

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Property create error:", error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
