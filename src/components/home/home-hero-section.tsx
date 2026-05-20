import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { SmartSearchPanel } from "@/components/home/smart-search-panel";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=900&fit=crop";

export function HomeHeroSection() {
  return (
    <section className="relative min-h-[520px] overflow-hidden border-b border-border lg:min-h-[580px]">
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/88 to-white/40 lg:to-white/20" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
          <div className="max-w-xl pt-2 lg:col-span-5 lg:max-w-none lg:pt-8 xl:col-span-4">
            <p className="inline-flex items-center gap-2 rounded-pill border border-primary/25 bg-primary-light px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
              <ShieldCheck size={13} />
              Verified · Managed · Trusted
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]">
              Find verified properties with managed support, only on KrrishJazz.
            </h1>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              Search smart. Connect with experts. Close with confidence.
            </p>
          </div>
          <SmartSearchPanel variant="hero" className="w-full lg:col-span-7 lg:mt-4 xl:col-span-8" />
        </div>
      </div>
    </section>
  );
}
