"use client";

import { usePathname, useRouter } from "next/navigation";
import { BadgeCheck, Headphones, Home, ShieldCheck } from "lucide-react";

const HIDDEN_PREFIXES = ["/admin", "/broker"];

export function BrokerageTrustBar() {
  const pathname = usePathname();
  const router = useRouter();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  return (
    <div className="border-b border-primary/10 bg-primary-light">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 text-xs font-semibold text-foreground sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-primary">
            <Home size={14} />
            Post free
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Headphones size={14} className="text-primary" />
            Managed callbacks
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheck size={14} className="text-primary" />
            One month brokerage only on closure
          </span>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard?tab=post")}
          className="inline-flex items-center gap-1.5 text-primary hover:text-accent"
        >
          <ShieldCheck size={14} />
          List property
        </button>
      </div>
    </div>
  );
}
