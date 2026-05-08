import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { propertySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { sendSMS, SMS_TEMPLATES } from "@/lib/twilio";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

function toListingStatus(status: string) {
  if (status === "PENDING_REVIEW") return "PENDING";
  if (status === "LIVE") return "LIVE";
  if (status === "REJECTED") return "REJECTED";
  return status;
}

function formatProperty(property: any, options: { publicView: boolean }) {
  const listingStatus = ["LIVE", "REJECTED"].includes(property.status)
    ? toListingStatus(property.status)
    : property.listingStatus || toListingStatus(property.status);

  const formatted = {
    ...property,
    listingStatus,
    publicBrokerName: property.publicBrokerName || "KrrishJazz",
    verified: property.status === "LIVE" || listingStatus === "LIVE",
    amenities: JSON.parse(property.amenities || "[]"),
    images: JSON.parse(property.images || "[]"),
  };

  if (!options.publicView) return formatted;

  const safeProperty = { ...formatted };
  delete safeProperty.postedById;
  delete safeProperty.assignedBrokerId;
  delete safeProperty.assignedBroker;

  return {
    ...safeProperty,
    postedBy: { name: formatted.publicBrokerName, role: "VERIFIED" },
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const skip = (page - 1) * limit;

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
        where.visibilityType = "PUBLIC_TO_CUSTOMERS";
      }
    }

    const listingType = searchParams.get("listingType");
    if (listingType) where.listingType = listingType as any;

    const category = searchParams.get("category");
    if (category) where.category = category as any;

    const propertyType = searchParams.get("propertyType");
    if (propertyType) where.propertyType = propertyType;

    const city = searchParams.get("city");
    if (city) where.city = { contains: city };

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as any).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as any).lte = parseFloat(maxPrice);
    }

    const bedrooms = searchParams.get("bedrooms");
    if (bedrooms) where.bedrooms = parseInt(bedrooms);

    const furnishing = searchParams.get("furnishing");
    if (furnishing) where.furnishing = furnishing;

    const q = searchParams.get("q");
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { city: { contains: q } },
        { address: { contains: q } },
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

    if (session.role !== "OWNER" && session.role !== "BROKER" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Only owners and approved brokers can post properties" }, { status: 403 });
    }

    if (session.role === "BROKER" && session.brokerStatus !== "APPROVED") {
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

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        price: propertyData.price,
        slug,
        postedById: session.id,
        assignedBrokerId:
          session.role === "ADMIN" && assignedBrokerId ? assignedBrokerId : session.role === "BROKER" ? session.id : null,
        visibilityType,
        listingStatus: "PENDING",
        publicBrokerName: publicBrokerName || "KrrishJazz",
        status: "PENDING_REVIEW",
        amenities: JSON.stringify(amenities),
        images: JSON.stringify(images),
        coverImage: coverImage || images[0] || null,
      },
    });

    await sendSMS(session.phone, SMS_TEMPLATES.propertySubmitted());

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Property create error:", error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
