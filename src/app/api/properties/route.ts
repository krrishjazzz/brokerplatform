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
import { normalizeListingForApi } from "@/lib/posting-config";
import { syncPrimaryFieldsFromTypeDetails } from "@/lib/posting-field-sync";
import { validatePostingPayload } from "@/lib/posting-validation";
import { formatProperty } from "@/server/public-property";
import { resolveLocationIdsAsync } from "@/lib/location/search";
import { computeListingQualityScore } from "@/lib/listing-quality-score";
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

    const city = searchParams.get("city") || "Kolkata";
    const locationIds = searchParams.getAll("locationId").filter(Boolean);

    if (locationIds.length > 0) {
      const resolved = await resolveLocationIdsAsync(locationIds, city);
      if (resolved.city) where.city = { contains: resolved.city, mode: "insensitive" };
      const terms = resolved.matchLocalities;
      if (terms.length > 0) {
        const multiLocalityOr = terms.flatMap((term) => [
          { locality: { contains: term, mode: "insensitive" as const } },
          { subLocality: { contains: term, mode: "insensitive" as const } },
        ]);
        where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { OR: multiLocalityOr }];
      }
    } else if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    const locality = locationIds.length > 0 ? null : searchParams.get("locality");
    const subLocality = searchParams.get("subLocality");
    const project = searchParams.get("project");
    const landmark = searchParams.get("landmark");
    const nearbyLocalities = searchParams.getAll("nearbyLocality").filter(Boolean);

    if (subLocality) where.subLocality = { contains: subLocality };
    if (project) where.projectOrSociety = { contains: project };
    if (landmark) where.landmark = { contains: landmark };

    if (locality || nearbyLocalities.length > 0) {
      const terms = Array.from(new Set([locality, ...nearbyLocalities].filter(Boolean))) as string[];
      const localityConditions = terms.flatMap((term) => [
        { locality: { contains: term, mode: "insensitive" as const } },
        { subLocality: { contains: term, mode: "insensitive" as const } },
      ]);
      if (localityConditions.length === 1) {
        Object.assign(where, localityConditions[0]);
      } else if (localityConditions.length > 1) {
        where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { OR: localityConditions }];
      }
    }

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
      const textOr: Record<string, unknown>[] = [
        { title: { contains: mergedQ, mode: "insensitive" } },
        { description: { contains: mergedQ, mode: "insensitive" } },
        { city: { contains: mergedQ, mode: "insensitive" } },
        { locality: { contains: mergedQ, mode: "insensitive" } },
        { subLocality: { contains: mergedQ, mode: "insensitive" } },
        { projectOrSociety: { contains: mergedQ, mode: "insensitive" } },
        { landmark: { contains: mergedQ, mode: "insensitive" } },
      ];
      if (!publicView) {
        textOr.push({ address: { contains: mergedQ, mode: "insensitive" } });
      }
      if (where.AND) {
        where.AND = [...(Array.isArray(where.AND) ? where.AND : [where.AND]), { OR: textOr }];
      } else if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: textOr }];
        delete where.OR;
      } else {
        where.OR = textOr;
      }
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

    if (!session.canPostProperty && session.role !== "ADMIN") {
      if (session.canList && session.ownerStatus === "PENDING") {
        return NextResponse.json(
          { error: "Listing tools are pending approval. KrrishJazz will notify you when you can post." },
          { status: 403 }
        );
      }
      if (session.canList && session.ownerStatus === "REJECTED") {
        return NextResponse.json(
          { error: "Listing access was not approved. Contact KrrishJazz support." },
          { status: 403 }
        );
      }
      return NextResponse.json({ error: "Only approved owners and brokers can post properties" }, { status: 403 });
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

    const typeDetails = (parsed.data.typeSpecificDetails ?? {}) as Record<string, string>;
    const postingCheck = validatePostingPayload(parsed.data, typeDetails, parsed.data.images.length);
    if (!postingCheck.ok) {
      const firstError = Object.values(postingCheck.errors)[0];
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const synced = syncPrimaryFieldsFromTypeDetails(parsed.data, typeDetails);

    const slug = slugify(synced.title) + "-" + nanoid(6);

    const {
      amenities,
      images,
      assignedBrokerId,
      publicBrokerName,
      visibilityType,
      coverImage,
      typeSpecificDetails,
      listingIntent: _listingIntent,
      ...propertyData
    } = synced;
    const normalizedVisibilityType = visibilityType === "PUBLIC_TO_CUSTOMERS" ? "FULL_VISIBILITY" : visibilityType;

    const normalized = normalizeListingForApi({
      listingIntent: _listingIntent,
      category: propertyData.category,
      propertyType: propertyData.propertyType,
      typeSpecificDetails: (typeSpecificDetails ?? {}) as Record<string, unknown>,
    });

    const quality = computeListingQualityScore({
      images,
      price: Number(propertyData.price),
      city: propertyData.city,
      locality: propertyData.locality,
      subLocality: propertyData.subLocality,
      landmark: propertyData.landmark,
      projectOrSociety: propertyData.projectOrSociety,
      amenities,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      floor: propertyData.floor,
      totalFloors: propertyData.totalFloors,
      furnishing: propertyData.furnishing,
      description: propertyData.description,
      typeSpecificDetails: normalized.typeSpecificDetails as Record<string, string>,
      latestFreshness: null,
    });

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        listingType: normalized.listingType,
        category: normalized.category,
        price: propertyData.price,
        slug,
        listingQualityScore: quality.score,
        listingQualityBreakdown: JSON.stringify(quality.breakdown),
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
        typeSpecificDetails: JSON.stringify(normalized.typeSpecificDetails),
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
