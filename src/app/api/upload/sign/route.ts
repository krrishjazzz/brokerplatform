import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSignedUploadParams } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
    }

    const params = getSignedUploadParams();
    return NextResponse.json(params);
  } catch (error) {
    console.error("Upload sign error:", error);
    return NextResponse.json({ error: "Failed to generate upload params" }, { status: 500 });
  }
}
