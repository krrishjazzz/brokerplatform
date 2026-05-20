import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, Home, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

const INTENTS = [
  {
    id: "buy",
    title: "Buy",
    desc: "Find your dream home — Apartments, Villas, Plots & more",
    href: "/properties?listingType=BUY",
    cta: "Explore Buy",
    icon: Home,
    tone: "from-[#E8F4FC] to-white border-[#B8D9F0]",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
  },
  {
    id: "rent",
    title: "Rent",
    desc: "Comfortable spaces — Flats, PG, Co-living & more",
    href: "/properties?listingType=RENT",
    cta: "Explore Rent",
    icon: Key,
    tone: "from-[#E8F8F0] to-white border-[#B8E6CF]",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop",
  },
  {
    id: "commercial",
    title: "Commercial",
    desc: "Grow your business — Offices, Shops, Warehouses & more",
    href: "/properties?category=COMMERCIAL",
    cta: "Explore Commercial",
    icon: Building2,
    tone: "from-[#FFF4E8] to-white border-[#F5D9B8]",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
  },
];

export function ExploreByIntent() {
  return (
    <section className="bg-white py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Explore by property type</h2>
          <Link href="/properties" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {INTENTS.map((intent) => (
            <Link
              key={intent.id}
              href={intent.href}
              className={`group overflow-hidden rounded-2xl border bg-gradient-to-br shadow-card transition-all hover:-translate-y-1 hover:shadow-lift ${intent.tone}`}
            >
              <div className="relative h-36 overflow-hidden sm:h-40">
                <Image
                  src={intent.image}
                  alt=""
                  fill
                  sizes="(max-width:1024px) 100vw, 33vw"
                  className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-primary shadow-sm">
                  <intent.icon size={20} />
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground">{intent.title}</h3>
                <p className="mt-1 text-sm leading-6 text-text-secondary">{intent.desc}</p>
                <Button variant="outline" size="sm" className="mt-4 gap-1 border-primary/30 text-primary">
                  {intent.cta}
                  <ArrowRight size={14} />
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
