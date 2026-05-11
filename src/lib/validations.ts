import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile number (+91XXXXXXXXXX)");

export const otpSchema = z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric");

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  wantToListAsOwner: z.boolean().default(false),
});

export const brokerApplicationSchema = z.object({
  rera: z.string().min(3, "RERA number is required"),
  experience: z.coerce.number().min(0, "Experience must be 0 or more"),
  city: z.string().min(2, "City is required"),
  serviceAreas: z.string().optional().or(z.literal("")),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
});

export const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  listingType: z.enum(["BUY", "RENT", "RESALE", "LEASE", "COMMERCIAL"]),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "AGRICULTURAL", "HOSPITALITY"]),
  propertyType: z.string().min(1, "Property type is required"),
  price: z.coerce.number().positive("Price must be positive"),
  priceNegotiable: z.boolean().default(false),
  area: z.coerce.number().positive("Area must be positive"),
  areaUnit: z.string().default("sqft"),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  floor: z.coerce.number().int().min(0).optional(),
  totalFloors: z.coerce.number().int().min(0).optional(),
  ageYears: z.coerce.number().int().min(0).optional(),
  furnishing: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  address: z.string().min(5, "Address is required"),
  locality: z.string().min(2, "Locality is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  images: z.array(z.string()).min(1, "At least 1 image is required"),
  coverImage: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  visibilityType: z
    .enum(["PUBLIC_TO_CUSTOMERS", "BROKER_NETWORK_ONLY", "PRIVATE"])
    .default("PUBLIC_TO_CUSTOMERS"),
  assignedBrokerId: z.string().optional().or(z.literal("")),
  publicBrokerName: z.string().min(2).default("KrrishJazz"),
});

export const enquirySchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(2, "Name is required"),
  phone: phoneSchema,
  message: z.string().min(5, "Message is required"),
  visitDate: z.string().optional(),
});

export const requirementSchema = z.object({
  description: z.string().min(10, "Description is required"),
  propertyType: z.string().min(1, "Property type is required"),
  locality: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required"),
  budgetMin: z.coerce.number().positive().optional(),
  budgetMax: z.coerce.number().positive().optional(),
  status: z.enum(["ACTIVE", "MATCHING", "IN_DISCUSSION", "CLOSED", "DROPPED"]).default("ACTIVE"),
  urgency: z.enum(["LOW", "NORMAL", "HIGH", "HOT"]).default("NORMAL"),
  clientSeriousness: z.enum(["LOW", "MEDIUM", "HIGH", "VERIFIED"]).default("MEDIUM"),
  notes: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
});

export type PhoneInput = z.infer<typeof phoneSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BrokerApplicationInput = z.infer<typeof brokerApplicationSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
export type RequirementInput = z.infer<typeof requirementSchema>;
