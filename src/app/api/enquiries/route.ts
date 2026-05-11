import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { enquirySchema } from "@/lib/validations";
import { sendSMS, SMS_TEMPLATES } from "@/lib/twilio";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "received" or "sent"

    let enquiries;

    if (type === "received") {
      // Leads: enquiries on properties posted by this user
      enquiries = await prisma.enquiry.findMany({
        where: {
          property: { postedById: session.id },
        },
        include: {
          property: { select: { title: true, slug: true, coverImage: true } },
          customer: { select: { name: true, phone: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      if (session.role !== "ADMIN") {
        enquiries = enquiries.map((enquiry) => ({
          ...enquiry,
          phone: "",
          customer: enquiry.customer
            ? { ...enquiry.customer, phone: "", email: null }
            : enquiry.customer,
        }));
      }
    } else {
      // Sent: enquiries made by this user
      enquiries = await prisma.enquiry.findMany({
        where: { customerId: session.id },
        include: {
          property: {
            select: { title: true, slug: true, coverImage: true, city: true },
            
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("Get enquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Login required to send enquiries" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`enquiry:${ip}`, 5, 3600000)) {
      return NextResponse.json({ error: "Too many enquiries. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { id: parsed.data.propertyId },
      include: { postedBy: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        ...parsed.data,
        visitDate: parsed.data.visitDate ? new Date(parsed.data.visitDate) : null,
        customerId: session.id,
      },
    });

    await logActivity({
      actorId: session.id,
      eventType: "MANAGED_ENQUIRY_SUBMITTED",
      targetType: "PROPERTY",
      targetId: property.id,
      propertyId: property.id,
      metadata: { enquiryId: enquiry.id, source: "PUBLIC_PROPERTY_DETAIL" },
    });

    // Notify property owner/broker
    if (property.postedBy.phone) {
      await sendSMS(
        property.postedBy.phone,
        SMS_TEMPLATES.newEnquiry(property.title, parsed.data.name)
      );
    }

    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (error) {
    console.error("Enquiry error:", error);
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}
