import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FileCheck2,
  Headphones,
  MessageCircle,
  PhoneOff,
  ShieldCheck,
  Star,
} from "lucide-react";
const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Verified listings" },
  { icon: PhoneOff, label: "No spam calls" },
  { icon: Headphones, label: "Managed closure" },
  { icon: BadgeCheck, label: "Pay on closure only" },
];

export const BUDGET_SHORTCUTS = [
  { label: "Buy under 50L", href: "/properties?listingType=BUY&maxPrice=5000000" },
  { label: "Buy under 1Cr", href: "/properties?listingType=BUY&maxPrice=10000000" },
  { label: "Rent under 25K", href: "/properties?listingType=RENT&maxPrice=25000" },
  { label: "Rent under 50K", href: "/properties?listingType=RENT&maxPrice=50000" },
  { label: "Commercial under 1Cr", href: "/properties?category=COMMERCIAL&maxPrice=10000000" },
  { label: "Plots in Kolkata", href: "/properties?propertyType=Residential%20Plot&city=Kolkata" },
];

const FEATURED_LISTINGS = [
  {
    title: "3 BHK in New Town",
    meta: "New Town, Kolkata",
    price: "₹92L",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
    href: "/properties?q=New%20Town&propertyType=Apartment&verified=true",
  },
  {
    title: "Office in Salt Lake",
    meta: "Sector V, Kolkata",
    price: "₹1.15Cr",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    href: "/properties?q=Salt%20Lake&propertyType=Office%20Space&verified=true",
  },
  {
    title: "2 BHK for Rent",
    meta: "Ballygunge, Kolkata",
    price: "₹58K / mo",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
    href: "/properties?q=Ballygunge&listingType=RENT&verified=true",
  },
  {
    title: "Retail on Park Street",
    meta: "Park Street, Kolkata",
    price: "₹1.7L / mo",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
    href: "/properties?q=Park%20Street&propertyType=Shop&verified=true",
  },
];

const HOW_IT_WORKS = [
  { icon: FileCheck2, title: "Search verified listings", desc: "Filter by intent, locality, budget, and property type with a clean, focused experience." },
  { icon: MessageCircle, title: "Managed callbacks", desc: "KrrishJazz coordinates follow-up so you avoid spam and missed conversations." },
  { icon: BadgeCheck, title: "Close with confidence", desc: "Assisted closure support and transparent brokerage only when the deal completes." },
];

export function TrustStrip() {
  return (
    <div className="mx-auto mt-5 max-w-2xl">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border border-border/80 bg-white/90 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
        {TRUST_ITEMS.map((item, index) => (
          <span key={item.label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground sm:text-sm">
            <item.icon size={14} className="shrink-0 text-primary" />
            {item.label}
            {index < TRUST_ITEMS.length - 1 && <span className="hidden text-text-tertiary sm:inline">·</span>}
          </span>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-text-secondary sm:text-sm">
        1,200+ listings across Kolkata · Free owner listing · RM-managed follow-up
      </p>
    </div>
  );
}

export function BudgetShortcuts() {
  return (
    <section className="border-b border-border bg-surface-elevated/50 py-6">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-text-secondary">Popular budgets</p>
        <div className="flex flex-wrap justify-center gap-2">
          {BUDGET_SHORTCUTS.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="rounded-pill border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary-light hover:text-primary"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedListingsSection() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Featured verified picks</h2>
            <p className="mt-1 text-sm text-text-secondary">Handpicked listings with KrrishJazz verification signals.</p>
          </div>
          <Link href="/properties?verified=true" className="shrink-0 text-sm font-semibold text-primary hover:underline">
            See all verified →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_LISTINGS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group overflow-hidden rounded-2xl border border-border/80 bg-white shadow-card transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-lift"
            >
              <div className="relative h-36 overflow-hidden bg-surface-muted">
                <Image src={item.image} alt={item.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-pill bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-success shadow-sm">
                  <CheckCircle2 size={10} />
                  Verified
                </span>
              </div>
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary">{item.title}</p>
                  <Star size={14} className="shrink-0 text-warning" />
                </div>
                <p className="mt-1 text-xs text-text-secondary">{item.meta}</p>
                <p className="mt-2 text-sm font-bold text-primary">{item.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="border-y border-border bg-primary-light/30 py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">How KrrishJazz works</h2>
          <p className="mt-2 text-sm text-text-secondary">Premium discovery with managed support — not a noisy listing dump.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-border/80 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                <step.icon size={20} />
              </span>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-primary">Step {index + 1}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{step.title}</p>
              <p className="mt-2 text-xs leading-5 text-text-secondary">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/properties?verified=true" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Explore verified listings
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="border-y border-border bg-surface py-3">
      <p className="text-center text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</p>
    </div>
  );
}
