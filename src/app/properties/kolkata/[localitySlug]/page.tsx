import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocationSeoMeta } from "@/lib/location/search";

type PageProps = {
  params: { localitySlug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const meta = await getLocationSeoMeta("kolkata", params.localitySlug);
  if (!meta?.localityName) {
    return { title: "Properties in Kolkata | KrrishJazz" };
  }
  return {
    title: `Properties in ${meta.localityName}, Kolkata | KrrishJazz`,
    description: `Find verified homes and commercial spaces in ${meta.localityName}, Kolkata.`,
  };
}

export const dynamic = "force-dynamic";

export default async function KolkataLocalityPropertiesPage({ params }: PageProps) {
  const meta = await getLocationSeoMeta("kolkata", params.localitySlug);
  if (!meta?.localityName) notFound();

  const count = await prisma.property.count({
    where: {
      status: "LIVE",
      city: { contains: "Kolkata", mode: "insensitive" },
      locality: { contains: meta.localityName, mode: "insensitive" },
    },
  });

  if (count === 0) {
    redirect(`/properties?city=Kolkata&locality=${encodeURIComponent(meta.localityName)}`);
  }

  const qs = new URLSearchParams({
    city: "Kolkata",
    locality: meta.localityName,
    preset: "residential_buy",
  });
  if (meta.localityId) qs.set("locationId", meta.localityId);
  redirect(`/properties?${qs.toString()}`);
}
