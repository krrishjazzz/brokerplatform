export const PROPERTY_CATEGORY_OPTIONS = [
  {
    value: "RESIDENTIAL",
    label: "Residential",
    hint: "Flats, houses, villas, floors, penthouses, studios",
  },
  {
    value: "COMMERCIAL",
    label: "Commercial",
    hint: "Offices, shops, showrooms, co-working, land, SCO",
  },
  {
    value: "INDUSTRIAL",
    label: "Industrial",
    hint: "Warehouse, factory, shed, cold storage, logistics",
  },
  {
    value: "AGRICULTURAL",
    label: "Agricultural",
    hint: "Farm land, farm house, plantation and orchard land",
  },
  {
    value: "HOSPITALITY",
    label: "Hospitality / Living",
    hint: "PG, hostel, serviced apartment, hotel, guest house",
  },
] as const;

export const PROPERTY_TYPES: Record<string, string[]> = {
  RESIDENTIAL: [
    "Apartment",
    "Builder Floor",
    "Independent House",
    "Villa",
    "Penthouse",
    "Studio Apartment",
    "Row House",
    "Residential Plot",
  ],
  COMMERCIAL: [
    "Office Space",
    "Co-working Space",
    "Shop",
    "Showroom",
    "SCO Plot",
    "Commercial Land",
    "Mall Space",
    "Restaurant / Cafe",
  ],
  INDUSTRIAL: [
    "Warehouse / Godown",
    "Factory",
    "Industrial Shed",
    "Industrial Building",
    "Industrial Plot",
    "Cold Storage",
    "Logistics Park",
  ],
  AGRICULTURAL: [
    "Agricultural Land",
    "Farm Land",
    "Farm House",
    "Plantation Land",
    "Orchard",
  ],
  HOSPITALITY: [
    "PG / Co-living",
    "Hostel",
    "Serviced Apartment",
    "Guest House",
    "Hotel / Resort",
  ],
};

export const PROPERTY_TYPE_GUIDE: Record<string, { fields: string[]; hint: string }> = {
  Apartment: { fields: ["BHK", "Bathrooms", "Floor", "Furnishing"], hint: "Buyers scan BHK, floor, maintenance, society amenities, and possession." },
  "Builder Floor": { fields: ["BHK", "Bathrooms", "Floor", "Parking"], hint: "Mention floor, lift, parking, ownership floor count, and approach road." },
  "Independent House": { fields: ["BHK", "Bathrooms", "Plot area", "Age"], hint: "Highlight land size, built-up area, road width, parking, and renovation age." },
  Villa: { fields: ["BHK", "Bathrooms", "Plot area", "Amenities"], hint: "Premium villa cards need frontage, garden, parking, clubhouse, and security." },
  Penthouse: { fields: ["BHK", "Bathrooms", "Terrace", "View"], hint: "Mention private terrace, top-floor privacy, lift access, and view." },
  "Studio Apartment": { fields: ["Room", "Furnishing", "Floor", "Rentability"], hint: "Great for rentals. Add furnishing, balcony, metro distance, and maintenance." },
  "Row House": { fields: ["BHK", "Bathrooms", "Parking", "Community"], hint: "Mention gated community, parking, garden, and usable terrace." },
  "Residential Plot": { fields: ["Plot area", "Road", "Facing", "Approvals"], hint: "Skip room fields. Add road width, facing, boundary, conversion, and approvals." },
  "Office Space": { fields: ["Area", "Seats", "Fit-out", "Parking"], hint: "Office listings should mention seats, cabins, pantry, washrooms, lift and power backup." },
  "Co-working Space": { fields: ["Seats", "Cabins", "Meeting rooms", "Internet"], hint: "Mention seats, dedicated desks, cabins, meeting rooms, and lock-in terms." },
  Shop: { fields: ["Frontage", "Floor", "Footfall", "Road"], hint: "Retail buyers care about frontage, visibility, footfall, signage and main-road access." },
  Showroom: { fields: ["Frontage", "Ceiling", "Parking", "Visibility"], hint: "Add frontage, ceiling height, glass facade, road width and parking." },
  "SCO Plot": { fields: ["Plot area", "FAR", "Frontage", "Approvals"], hint: "For shop-cum-office, mention FAR, floors allowed, road, possession and authority approvals." },
  "Commercial Land": { fields: ["Land area", "FAR", "Road", "Use"], hint: "Skip room fields. Mention zoning, FAR, road width and commercial use permission." },
  "Mall Space": { fields: ["Carpet area", "Floor", "Footfall", "Brand mix"], hint: "Mention mall name, floor, anchor stores, food court proximity and CAM." },
  "Restaurant / Cafe": { fields: ["Kitchen", "Exhaust", "Frontage", "License"], hint: "Add kitchen setup, exhaust, seating, frontage, gas line and license status." },
  "Warehouse / Godown": { fields: ["Clear height", "Dock", "Truck access", "Power"], hint: "Mention clear height, loading dock, truck movement, flooring and power load." },
  Factory: { fields: ["Power", "Shed", "Office", "Compliance"], hint: "Mention sanctioned load, crane, labour rooms, pollution category and access." },
  "Industrial Shed": { fields: ["Shed area", "Height", "Power", "Access"], hint: "Add roof height, flooring, power load, gate width and trailer access." },
  "Industrial Building": { fields: ["Floors", "Power", "Lift", "Compliance"], hint: "Mention goods lift, floor loading, fire NOC and industrial permissions." },
  "Industrial Plot": { fields: ["Plot area", "Zoning", "Road", "Power"], hint: "Skip room fields. Add zoning, boundary, power availability and road width." },
  "Cold Storage": { fields: ["Capacity", "Temperature", "Power", "Dock"], hint: "Mention chamber capacity, temperature range, backup power and loading bays." },
  "Logistics Park": { fields: ["Area", "Docks", "Highway", "Clear height"], hint: "Add highway distance, dock count, trailer circulation and clear height." },
  "Agricultural Land": { fields: ["Land area", "Water", "Road", "Soil"], hint: "Mention water source, road access, soil type, conversion possibility and fencing." },
  "Farm Land": { fields: ["Land area", "Water", "Access", "Fencing"], hint: "Add water, electricity, fencing, caretaker room and approach road." },
  "Farm House": { fields: ["Land area", "Rooms", "Pool", "Access"], hint: "Mention built-up rooms, lawn, pool, borewell, road and weekend-home readiness." },
  "Plantation Land": { fields: ["Crop", "Yield", "Water", "Access"], hint: "Mention crop type, age, annual yield, water and labour availability." },
  Orchard: { fields: ["Trees", "Yield", "Water", "Road"], hint: "Mention tree count, fruit type, yield, irrigation and farm equipment." },
  "PG / Co-living": { fields: ["Beds", "Sharing", "Food", "Rules"], hint: "Mention bed count, sharing type, meals, Wi-Fi, security, house rules and lock-in." },
  Hostel: { fields: ["Beds", "Rooms", "Food", "Security"], hint: "Mention student/working profile, capacity, common areas, food and security." },
  "Serviced Apartment": { fields: ["Rooms", "Furnishing", "Services", "Stay terms"], hint: "Add housekeeping, bills, kitchen, minimum stay and corporate suitability." },
  "Guest House": { fields: ["Rooms", "Occupancy", "Kitchen", "License"], hint: "Mention rooms, occupancy, staff room, kitchen, parking and license status." },
  "Hotel / Resort": { fields: ["Keys", "Occupancy", "F&B", "License"], hint: "Mention keys, restaurant, banquet, occupancy, revenue and license status." },
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
  "Balcony",
  "Modular Kitchen",
  "Gated Community",
  "EV Charging",
  "Terrace",
];

export const CATEGORY_AMENITIES: Record<string, string[]> = {
  RESIDENTIAL: ["Parking", "Lift", "24x7 Security", "Power Backup", "Gym", "Swimming Pool", "Garden", "Club House", "Children Play Area", "Balcony", "Modular Kitchen", "Gated Community", "EV Charging"],
  COMMERCIAL: ["Parking", "Lift", "Power Backup", "24x7 Security", "CCTV", "Fire Safety", "Visitor Parking", "Pantry", "Conference Room", "Internet", "Signage", "Main Road"],
  INDUSTRIAL: ["Power Backup", "24x7 Security", "CCTV", "Fire Safety", "Visitor Parking", "Loading Dock", "Truck Access", "High Ceiling", "Three Phase Power", "Water Supply"],
  AGRICULTURAL: ["Water Supply", "Borewell", "Fencing", "Road Access", "Electricity", "Farm House", "Drip Irrigation", "Caretaker Room"],
  HOSPITALITY: ["Parking", "24x7 Security", "Power Backup", "CCTV", "Fire Safety", "Wi-Fi", "Food Service", "Housekeeping", "Laundry", "Reception"],
};

export const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully Furnished", "Bare Shell", "Warm Shell", "Plug-and-Play"];

export const AREA_UNITS = ["sqft", "sqm", "sqyd", "acre", "bigha", "katha", "hectare"];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry",
];

export const INDIAN_CITIES = [
  "Kolkata",
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Ahmedabad",
  "Gurugram",
  "Noida",
  "Lucknow",
  "Jaipur",
  "Surat",
  "Chandigarh",
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
  { label: "Plots/Land", href: "/properties?propertyType=Residential%20Plot" },
  { label: "Post Property", href: "/dashboard?tab=post", badge: "FREE", badgeColor: "green" },
];
