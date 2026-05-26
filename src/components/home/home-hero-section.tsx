import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { SmartSearchPanel } from "@/components/home/smart-search-panel";

/** Modern home at dusk — matches marketing hero reference. */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop&q=80";

export function HomeHeroSection() {
  return (
    <section className="relative overflow-x-clip border-b border-border">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover object-[center_35%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/97 via-white/88 to-white/55 sm:bg-gradient-to-r sm:from-white sm:from-[42%] sm:via-white/92 sm:via-[58%] sm:to-white/25" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 py-12 text-center sm:py-14 lg:px-6 lg:py-20">
        <p className="inline-flex items-center gap-2 rounded-pill border border-primary/20 bg-white/90 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-primary shadow-sm backdrop-blur-sm">
          <ShieldCheck size={14} className="shrink-0" aria-hidden />
          Verified · Managed · Trusted
        </p>

        <h1 className="mt-5 max-w-3xl text-[1.75rem] font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          Find verified properties with managed support, only on KrrishJazz.
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
          Search smart. Connect with experts. Close with confidence.
        </p>

        <div className="relative z-20 mt-8 w-full max-w-[920px] overflow-visible sm:mt-10">
          <SmartSearchPanel variant="hero" className="text-left" />
        </div>
      </div>
    </section>
  );
}
