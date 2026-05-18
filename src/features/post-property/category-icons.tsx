import type { ReactNode } from "react";
import { Building2, Factory, Home, Store, Trees } from "lucide-react";

export const CATEGORY_ICON_MAP: Record<string, ReactNode> = {
  RESIDENTIAL: <Home size={20} />,
  COMMERCIAL: <Store size={20} />,
  INDUSTRIAL: <Factory size={20} />,
  AGRICULTURAL: <Trees size={20} />,
  HOSPITALITY: <Building2 size={20} />,
};
