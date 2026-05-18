import Link from "next/link";
import { HorizontalCarousel } from "./horizontal-carousel";
import type { CarouselCard } from "./home-data";

type BrowseSectionProps = {
  title: string;
  items: CarouselCard[];
  viewAllHref?: string;
};

export function BrowseSection({ title, items, viewAllHref = "/properties" }: BrowseSectionProps) {
  return (
    <section className="py-6">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
          <Link href={viewAllHref} className="shrink-0 text-xs font-semibold text-primary hover:underline sm:text-sm">
            View All
          </Link>
        </div>
        <HorizontalCarousel items={items} variant="browse" />
      </div>
    </section>
  );
}

export function PopularLocationsSection({ items }: { items: CarouselCard[] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Popular locations</h2>
          <p className="mt-1 text-sm text-text-secondary">Explore high-demand neighbourhoods across Kolkata.</p>
        </div>
        <Link href="/properties?city=Kolkata" className="shrink-0 text-sm font-semibold text-primary hover:underline">
          View all →
        </Link>
      </div>
      <HorizontalCarousel items={items} variant="location" />
    </div>
  );
}
