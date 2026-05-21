import { HomeOwnerRedirect } from "@/components/home/home-owner-redirect";
import { HomeHeroSection } from "@/components/home/home-hero-section";
import { TrustValueBar } from "@/components/home/trust-value-bar";
import { PopularLocationsGrid } from "@/components/home/popular-locations-grid";
import { FeaturedListingsSection } from "@/components/home/home-sections";
import { HomeContinueJourneyStrip } from "@/components/home/home-inline-login-section";
import { HomeRequirementSection } from "@/components/home/home-requirement-section";
import { HomeOwnerCta } from "@/components/home/home-owner-cta";
import { POPULAR_LOCATIONS } from "@/components/home/home-data";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface text-foreground">
      <HomeOwnerRedirect />
      <HomeHeroSection />
      <TrustValueBar />
      <PopularLocationsGrid items={POPULAR_LOCATIONS} />
      <FeaturedListingsSection />
      <HomeContinueJourneyStrip />
      <HomeRequirementSection />
      <HomeOwnerCta />
    </main>
  );
}
