import { HomeHeroSection } from "@/components/home/home-hero-section";
import { TrustValueBar } from "@/components/home/trust-value-bar";
import { PopularLocationsGrid } from "@/components/home/popular-locations-grid";
import { ExploreByIntent } from "@/components/home/explore-by-intent";
import { WhyChooseSection } from "@/components/home/why-choose-section";
import { HomeDualCta } from "@/components/home/home-dual-cta";
import { POPULAR_LOCATIONS } from "@/components/home/home-data";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface text-foreground">
      <HomeHeroSection />
      <TrustValueBar />
      <PopularLocationsGrid items={POPULAR_LOCATIONS} />
      <ExploreByIntent />
      <WhyChooseSection />
      <HomeDualCta />
    </main>
  );
}
