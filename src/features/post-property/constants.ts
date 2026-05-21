export const POST_PROPERTY_STEPS = [
  "Basic Details",
  "Price & Size",
  "Location",
  "Photos",
  "Review",
] as const;

export const POST_PROPERTY_DRAFT_KEY = "krrishjazz:post-property-draft:v1";
export const POST_PROPERTY_SUCCESS_KEY = "krrishjazz:post-property-just-submitted:v1";
export const POST_PROPERTY_DRAFT_DEBOUNCE_MS = 1200;

export const POST_PROPERTY_FIELD_STEP_MAP: Record<string, number> = {
  listingIntent: 0,
  listingType: 0,
  category: 0,
  propertyType: 0,
  title: 4,
  description: 4,
  typeSpecificDetails: 1,
  price: 1,
  area: 1,
  areaUnit: 1,
  bedrooms: 1,
  bathrooms: 1,
  floor: 1,
  totalFloors: 1,
  ageYears: 1,
  furnishing: 1,
  priceNegotiable: 1,
  address: 2,
  locality: 2,
  city: 2,
  state: 2,
  pincode: 2,
  lat: 2,
  lng: 2,
  amenities: 3,
  images: 3,
  coverImage: 3,
  visibilityType: 3,
  publicBrokerName: 3,
  videoUrl: 3,
};
