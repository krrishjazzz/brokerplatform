"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type PropertySearchNavbarContextValue = {
  compactActive: boolean;
  setCompactActive: (active: boolean) => void;
  compactBar: ReactNode | null;
  setCompactBar: (node: ReactNode | null) => void;
};

const PropertySearchNavbarContext = createContext<PropertySearchNavbarContextValue | null>(null);

export function PropertySearchNavbarProvider({ children }: { children: ReactNode }) {
  const [compactActive, setCompactActive] = useState(false);
  const [compactBar, setCompactBar] = useState<ReactNode | null>(null);

  const value = useMemo(
    () => ({
      compactActive,
      setCompactActive,
      compactBar,
      setCompactBar,
    }),
    [compactActive, compactBar]
  );

  return (
    <PropertySearchNavbarContext.Provider value={value}>{children}</PropertySearchNavbarContext.Provider>
  );
}

export function usePropertySearchNavbar() {
  const ctx = useContext(PropertySearchNavbarContext);
  if (!ctx) {
    throw new Error("usePropertySearchNavbar must be used within PropertySearchNavbarProvider");
  }
  return ctx;
}
