import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { CarouselCard } from "@/components/home/home-data";

export function PopularLocationsGrid({ items }: { items: CarouselCard[] }) {
  return (
    <section className="bg-surface py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Popular localities in Kolkata</h2>
          <Link href="/properties?city=Kolkata" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all localities
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {items.slice(0, 6).map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-card transition-transform hover:-translate-y-1 hover:shadow-lift"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width:640px) 50vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001F4D]/85 via-[#001F4D]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="text-sm font-bold leading-tight">{item.title}</p>
                {item.subtitle && (
                  <p className="mt-0.5 text-[11px] font-medium text-white/85">{item.subtitle}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
