import { ShieldCheck } from "lucide-react";

export function PropertiesTrustBanner() {
  return (
    <p className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary-light/40 px-3 py-2 text-xs font-medium text-foreground sm:text-sm">
      <ShieldCheck size={15} className="shrink-0 text-primary" />
      All listings are KrrishJazz checked before publishing.
    </p>
  );
}
