import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Properties in Kolkata | KrrishJazz",
  description:
    "Browse verified properties for sale and rent in Kolkata. Managed enquiries and expert support on KrrishJazz.",
};

export const dynamic = "force-dynamic";

export default async function KolkataPropertiesPage() {
  const count = await prisma.property.count({
    where: {
      status: "LIVE",
      city: { contains: "Kolkata", mode: "insensitive" },
    },
  });

  if (count === 0) {
    redirect("/properties?city=Kolkata");
  }

  redirect("/properties?city=Kolkata&preset=residential_buy");
}
