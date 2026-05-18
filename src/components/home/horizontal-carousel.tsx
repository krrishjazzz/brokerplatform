import Link from "next/link";
import Image from "next/image";
import type { CarouselCard } from "./home-data";

type HorizontalCarouselProps = {
  items: CarouselCard[];
  variant?: "location" | "browse";
};

export function HorizontalCarousel({ items, variant = "browse" }: HorizontalCarouselProps) {
  const isLocation = variant === "location";

  return (
    <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 scrollbar-none">
      {items.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className={
            isLocation
              ? "group w-[188px] shrink-0 snap-start overflow-hidden rounded-2xl border border-border/80 bg-white shadow-[0_4px_16px_rgba(0,31,77,0.06)] transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_8px_24px_rgba(0,92,168,0.12)] sm:w-[200px]"
              : "group w-[148px] shrink-0 snap-start overflow-hidden rounded-xl border border-border/80 bg-white shadow-[0_4px_16px_rgba(0,31,77,0.06)] transition-all hover:-translate-y-0.5 hover:border-primary/25 sm:w-[160px]"
          }
        >
          <div className={`relative w-full overflow-hidden bg-surface-muted ${isLocation ? "h-[112px]" : "h-[92px]"}`}>
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes={isLocation ? "200px" : "160px"}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001F4D]/70 via-[#001F4D]/10 to-transparent" />
          </div>
          <div className={isLocation ? "p-3" : "p-2.5"}>
            <p className={`font-semibold text-foreground ${isLocation ? "text-sm" : "text-xs leading-tight"}`}>{item.title}</p>
            {item.subtitle && <p className="mt-0.5 text-[11px] text-text-secondary">{item.subtitle}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}
