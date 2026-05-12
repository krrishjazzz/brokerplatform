import type { ReactNode } from "react";
import { CheckCircle, Phone, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function adminStatusVariant(status?: string) {
  switch (status) {
    case "LIVE":
    case "AVAILABLE":
    case "APPROVED":
    case "CONTACTED":
    case "VISIT_SCHEDULED":
    case "NEGOTIATING":
      return "success";
    case "PENDING_REVIEW":
    case "PENDING":
    case "ON_HOLD":
    case "NEW":
      return "warning";
    case "REJECTED":
    case "CLOSED":
    case "LOST":
      return "error";
    default:
      return "default";
  }
}

export function readableStatus(status?: string) {
  return (status || "UNKNOWN").replaceAll("_", " ");
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 rounded-card border border-primary/10 bg-white p-5 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {eyebrow && <p className="text-xs font-bold uppercase tracking-wide text-primary">{eyebrow}</p>}
          <h1 className="mt-1 text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{description}</p>
        </div>
        {right}
      </div>
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full lg:w-80">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-btn border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-card border border-dashed border-primary/25 bg-white p-8 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
        <CheckCircle size={20} />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-text-secondary">{description}</p>
    </div>
  );
}

export function OpsMiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-btn border border-border bg-surface p-3">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function OpsPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-white p-4 shadow-card">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function PersonBlock({ title, person }: { title: string; person?: any }) {
  if (!person) return <EmptyOpsText text={`${title}: not assigned.`} />;
  const profile = person.brokerProfile;
  return (
    <div className="rounded-btn border border-border bg-surface p-3">
      <p className="text-xs font-semibold uppercase text-text-secondary">{title}</p>
      <p className="mt-1 font-semibold text-foreground">{person.name || person.phone || "Unknown"}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
        <Phone size={12} /> {person.phone || "No phone"}
      </p>
      {profile && (
        <div className="mt-2 flex flex-wrap gap-1">
          {profile.rera && <Badge variant="blue">RERA</Badge>}
          <Badge variant="accent">{profile.responseScore || 70}% response</Badge>
          <Badge variant="default">{profile.completedCollaborations || 0} collabs</Badge>
        </div>
      )}
    </div>
  );
}

export function TimelineRow({
  title,
  meta,
  note,
  variant,
}: {
  title: string;
  meta: string;
  note?: string | null;
  variant: string;
}) {
  return (
    <div className="rounded-btn border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <Badge variant={variant as any}>{variant === "default" ? "event" : title.split(" ")[0]}</Badge>
      </div>
      <p className="mt-1 text-xs text-text-secondary">{meta}</p>
      {note && <p className="mt-2 line-clamp-2 text-xs leading-5 text-text-secondary">{note}</p>}
    </div>
  );
}

export function EmptyOpsText({ text }: { text: string }) {
  return <p className="rounded-btn border border-dashed border-border bg-surface p-3 text-sm text-text-secondary">{text}</p>;
}

export function parseServiceAreas(value?: string) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function Skeleton() {
  return (
    <div className="bg-white rounded-card border border-border p-6 animate-pulse space-y-4">
      <div className="h-4 bg-surface rounded w-1/3" />
      <div className="h-10 bg-surface rounded" />
      <div className="h-10 bg-surface rounded" />
      <div className="h-10 bg-surface rounded" />
    </div>
  );
}
