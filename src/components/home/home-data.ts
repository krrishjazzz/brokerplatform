export type CarouselCard = {
  title: string;
  href: string;
  image: string;
  subtitle?: string;
};

export const POPULAR_LOCATIONS: CarouselCard[] = [
  {
    title: "New Town",
    subtitle: "1,284 properties",
    href: "/properties?locality=New%20Town&city=Kolkata",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=480&h=320&fit=crop",
  },
  {
    title: "Salt Lake",
    subtitle: "982 properties",
    href: "/properties?locality=Salt%20Lake&city=Kolkata",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=480&h=320&fit=crop",
  },
  {
    title: "Rajarhat",
    subtitle: "756 properties",
    href: "/properties?locality=Rajarhat&city=Kolkata",
    image: "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=480&h=320&fit=crop",
  },
  {
    title: "Ballygunge",
    subtitle: "643 properties",
    href: "/properties?locality=Ballygunge&city=Kolkata",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=480&h=320&fit=crop",
  },
  {
    title: "Behala",
    subtitle: "512 properties",
    href: "/properties?locality=Behala&city=Kolkata",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=480&h=320&fit=crop",
  },
  {
    title: "EM Bypass",
    subtitle: "1,102 properties",
    href: "/properties?locality=EM%20Bypass&city=Kolkata",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=480&h=320&fit=crop",
  },
];

export const BROWSE_BUY: CarouselCard[] = [
  { title: "Flats / Apartments", href: "/properties?listingType=BUY&propertyType=Apartment", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=280&fit=crop" },
  { title: "Builder Floors", href: "/properties?listingType=BUY&propertyType=Builder%20Floor", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=280&fit=crop" },
  { title: "Independent House / Villa", href: "/properties?listingType=BUY&propertyType=Independent%20House", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=280&fit=crop" },
  { title: "Residential Land", href: "/properties?listingType=BUY&propertyType=Residential%20Plot", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=280&fit=crop" },
  { title: "1 RK / Studio", href: "/properties?listingType=BUY&propertyType=Studio%20Apartment", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=280&fit=crop" },
  { title: "Farm Houses", href: "/properties?listingType=BUY&propertyType=Farm%20House", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=280&fit=crop" },
  { title: "Projects", href: "/properties?listingType=BUY&q=project", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=280&fit=crop" },
];

export const BROWSE_RENT: CarouselCard[] = [
  { title: "Flats / Apartments", href: "/properties?listingType=RENT&propertyType=Apartment", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=280&fit=crop" },
  { title: "Builder Floors", href: "/properties?listingType=RENT&propertyType=Builder%20Floor", image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=280&fit=crop" },
  { title: "Independent House / Villa", href: "/properties?listingType=RENT&propertyType=Independent%20House", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=280&fit=crop" },
  { title: "PG / Co-living", href: "/properties?category=HOSPITALITY&propertyType=PG%20%2F%20Co-living", image: "https://images.unsplash.com/photo-1555854877-aeb186f2a011?w=400&h=280&fit=crop" },
  { title: "Serviced Apartments", href: "/properties?listingType=RENT&propertyType=Serviced%20Apartment", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=280&fit=crop" },
  { title: "Studio / 1 RK", href: "/properties?listingType=RENT&propertyType=Studio%20Apartment", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=280&fit=crop" },
  { title: "Rooms", href: "/properties?listingType=RENT&category=HOSPITALITY", image: "https://images.unsplash.com/photo-1595526114035-0d27360dfaaf?w=400&h=280&fit=crop" },
];

export const BROWSE_COMMERCIAL: CarouselCard[] = [
  { title: "Office Spaces", href: "/properties?category=COMMERCIAL&propertyType=Office%20Space", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=280&fit=crop" },
  { title: "Shops / Showrooms", href: "/properties?category=COMMERCIAL&propertyType=Shop", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=280&fit=crop" },
  { title: "Co-working Spaces", href: "/properties?category=COMMERCIAL&propertyType=Co-working%20Space", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=280&fit=crop" },
  { title: "Warehouses", href: "/properties?category=INDUSTRIAL&propertyType=Warehouse%20%2F%20Godown", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=280&fit=crop" },
  { title: "Industrial Land", href: "/properties?category=INDUSTRIAL&propertyType=Industrial%20Plot", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=280&fit=crop" },
  { title: "Business Parks", href: "/properties?category=COMMERCIAL&propertyType=Office%20Space&q=business%20park", image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=280&fit=crop" },
  { title: "Hotel / Hospitality", href: "/properties?category=HOSPITALITY", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=280&fit=crop" },
];

export const BROWSE_PROJECTS: CarouselCard[] = [
  { title: "Residential Projects", href: "/properties?listingType=BUY&q=residential%20project", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=280&fit=crop" },
  { title: "Commercial Projects", href: "/properties?category=COMMERCIAL&q=project", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=280&fit=crop" },
  { title: "Luxury Projects", href: "/properties?listingType=BUY&q=luxury%20project", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=280&fit=crop" },
  { title: "Under Construction", href: "/properties?listingType=BUY&q=under%20construction", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=280&fit=crop" },
  { title: "New Launch", href: "/properties?listingType=BUY&q=new%20launch", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=280&fit=crop" },
  { title: "Ready to Move", href: "/properties?listingType=BUY&q=ready%20to%20move", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=280&fit=crop" },
  { title: "Top Developers", href: "/properties?listingType=BUY&q=developer", image: "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=400&h=280&fit=crop" },
];

export const BROWSE_PLOTS: CarouselCard[] = [
  { title: "Residential Plots", href: "/properties?propertyType=Residential%20Plot", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=280&fit=crop" },
  { title: "Commercial Plots", href: "/properties?propertyType=Commercial%20Land", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=280&fit=crop" },
  { title: "Agricultural Land", href: "/properties?propertyType=Agricultural%20Land", image: "https://images.unsplash.com/photo-1500595046743-be52debaef06?w=400&h=280&fit=crop" },
  { title: "Industrial Land", href: "/properties?propertyType=Industrial%20Plot", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=280&fit=crop" },
  { title: "Farm Land", href: "/properties?propertyType=Farm%20Land", image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=280&fit=crop" },
  { title: "Corner Plots", href: "/properties?propertyType=Residential%20Plot&q=corner", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=280&fit=crop" },
  { title: "Land in Project", href: "/properties?propertyType=Residential%20Plot&q=project", image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=280&fit=crop" },
];
