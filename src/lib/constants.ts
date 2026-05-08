export const PROPERTY_TYPES: Record<string, string[]> = {
  RESIDENTIAL: ["Apartment", "Villa", "Independent House", "Penthouse", "Studio", "Row House", "Plot"],
  COMMERCIAL: ["Office", "Shop", "Showroom", "Co-working", "Warehouse", "Industrial Shed"],
  INDUSTRIAL: ["Factory", "Warehouse", "Industrial Plot", "Industrial Shed"],
  AGRICULTURAL: ["Farm Land", "Agricultural Plot"],
};

export const AMENITIES = [
  "Parking",
  "Gym",
  "Swimming Pool",
  "Lift",
  "24x7 Security",
  "Power Backup",
  "Garden",
  "Club House",
  "Children Play Area",
  "Rain Water Harvesting",
  "Intercom",
  "Fire Safety",
  "CCTV",
  "Visitor Parking",
  "Jogging Track",
];

export const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry",
];

export const FEATURED_CITIES = [
  { name: "Mumbai", image: "/cities/mumbai.jpg" },
  { name: "Delhi", image: "/cities/delhi.jpg" },
  { name: "Bangalore", image: "/cities/bangalore.jpg" },
  { name: "Hyderabad", image: "/cities/hyderabad.jpg" },
  { name: "Chennai", image: "/cities/chennai.jpg" },
  { name: "Pune", image: "/cities/pune.jpg" },
];

export const NAV_TABS = [
  { label: "Buy", href: "/properties?listingType=BUY" },
  { label: "Rent", href: "/properties?listingType=RENT" },
  { label: "New Launch", href: "/properties?listingType=BUY&new=true", badge: "NEW" },
  { label: "Commercial", href: "/properties?category=COMMERCIAL" },
  { label: "Plots/Land", href: "/properties?propertyType=Plot" },
  { label: "Projects", href: "/projects" },
  { label: "Post Property", href: "/dashboard?tab=post", badge: "FREE", badgeColor: "green" },
];
