import { MIN_IMAGES_RECOMMENDED } from "@/lib/posting-validation";

export type ListingQualityInput = {
  images: string[];
  price: number;
  city: string;
  locality?: string | null;
  subLocality?: string | null;
  landmark?: string | null;
  projectOrSociety?: string | null;
  amenities: string[];
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  furnishing?: string | null;
  description: string;
  typeSpecificDetails?: Record<string, string>;
  latestFreshness?: {
    availabilityStatus: string;
    expiresAt?: string | null;
  } | null;
};

export type ListingQualityResult = {
  score: number;
  breakdown: Record<string, number>;
  tips: string[];
};

function scorePhotos(images: string[]): { points: number; tip?: string } {
  const count = images.filter(Boolean).length;
  if (count >= MIN_IMAGES_RECOMMENDED) return { points: 25 };
  if (count === 2) return { points: 18, tip: "Add one more photo for stronger buyer trust." };
  if (count === 1) return { points: 10, tip: "Add at least 3 clear photos." };
  return { points: 0, tip: "Upload photos — listings without images rarely convert." };
}

function scorePrice(price: number): { points: number; tip?: string } {
  if (Number.isFinite(price) && price > 0) return { points: 15 };
  return { points: 0, tip: "Add a clear price so buyers can compare quickly." };
}

function scoreLocality(input: ListingQualityInput): { points: number; tip?: string } {
  let points = 0;
  if (input.city?.trim()) points += 4;
  if (input.locality?.trim()) points += 5;
  if (input.subLocality?.trim()) points += 3;
  if (input.landmark?.trim() || input.projectOrSociety?.trim()) points += 3;
  if (points >= 12) return { points: 15 };
  if (points > 0) return { points, tip: "Add locality, landmark, or society name for better discovery." };
  return { points: 0, tip: "Complete location fields (city, locality, landmark)." };
}

function scoreAmenities(amenities: string[]): { points: number; tip?: string } {
  const count = amenities.filter(Boolean).length;
  if (count >= 3) return { points: 10 };
  if (count > 0) return { points: 5, tip: "Add a few more amenities buyers filter on." };
  return { points: 0, tip: "Select amenities relevant to your property type." };
}

function scoreFloorAndRooms(input: ListingQualityInput): { points: number; tip?: string } {
  const details = input.typeSpecificDetails ?? {};
  const hasRooms =
    input.bedrooms != null ||
    input.bathrooms != null ||
    Boolean(details.bhk || details.bedrooms);
  const hasFloor =
    input.floor != null ||
    input.totalFloors != null ||
    Boolean(details.floorNumber || details.totalFloors);
  if (hasRooms && hasFloor) return { points: 10 };
  if (hasRooms || hasFloor) return { points: 6, tip: "Add floor and room details where applicable." };
  return { points: 2 };
}

function scoreOwnership(details: Record<string, string>): { points: number; tip?: string } {
  const ownership = details.ownershipType || details.ownership || details.titleType;
  if (ownership?.trim()) return { points: 5 };
  return { points: 0, tip: "Mention ownership type (freehold / leasehold) if relevant." };
}

function scoreDescription(description: string): { points: number; tip?: string } {
  const len = description?.trim().length ?? 0;
  if (len >= 150) return { points: 10 };
  if (len >= 80) return { points: 7, tip: "Expand the description with USPs and nearby landmarks." };
  if (len >= 20) return { points: 4, tip: "Write a fuller description (80+ characters recommended)." };
  return { points: 0, tip: "Add a clear property description." };
}

function scoreFreshness(
  latest?: ListingQualityInput["latestFreshness"]
): { points: number; tip?: string } {
  if (!latest) return { points: 3, tip: "Confirm availability to keep the listing fresh." };
  const expired =
    latest.expiresAt && new Date(latest.expiresAt).getTime() < Date.now();
  if (latest.availabilityStatus === "AVAILABLE" && !expired) return { points: 10 };
  if (latest.availabilityStatus === "ON_HOLD") {
    return { points: 4, tip: "Listing is on hold — resume when ready for buyers." };
  }
  return { points: 2, tip: "Refresh availability so buyers see an active listing." };
}

export function computeListingQualityScore(input: ListingQualityInput): ListingQualityResult {
  const photos = scorePhotos(input.images);
  const price = scorePrice(Number(input.price));
  const locality = scoreLocality(input);
  const amenities = scoreAmenities(input.amenities);
  const floorRooms = scoreFloorAndRooms(input);
  const ownership = scoreOwnership(input.typeSpecificDetails ?? {});
  const description = scoreDescription(input.description);
  const freshness = scoreFreshness(input.latestFreshness);

  const breakdown = {
    photos: photos.points,
    price: price.points,
    locality: locality.points,
    amenities: amenities.points,
    floorRooms: floorRooms.points,
    ownership: ownership.points,
    description: description.points,
    freshness: freshness.points,
  };

  const score = Math.min(
    100,
    Object.values(breakdown).reduce((sum, value) => sum + value, 0)
  );

  const tips = [
    photos.tip,
    price.tip,
    locality.tip,
    amenities.tip,
    floorRooms.tip,
    ownership.tip,
    description.tip,
    freshness.tip,
  ].filter((tip): tip is string => Boolean(tip));

  return { score, breakdown, tips: tips.slice(0, 4) };
}

export function listingQualityLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Needs work";
}
