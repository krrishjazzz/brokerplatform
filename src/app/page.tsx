import { Sparkles } from "lucide-react";
import { SmartSearchPanel } from "@/components/home/smart-search-panel";
import { PopularLocationsSection } from "@/components/home/browse-section";
import { ConsolidatedBrowseSection } from "@/components/home/consolidated-browse-section";
import { JoinBrokerNetworkCta, OwnerListPropertyCta } from "@/components/home/home-cta-sections";
import {
  BudgetShortcuts,
  FeaturedListingsSection,
  HowItWorksSection,
  TrustStrip,
} from "@/components/home/home-sections";
import { POPULAR_LOCATIONS } from "@/components/home/home-data";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface pb-0 text-foreground">
      <section className="relative overflow-hidden border-b border-border-strong bg-gradient-to-b from-primary-light via-white to-surface">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 lg:px-6 lg:pt-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-pill border border-accent/30 bg-accent-light px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#92400E] shadow-sm">
              <Sparkles size={14} />
              Premium, no-noise property discovery
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-[44px]">
              Find verified homes, offices, and land in Kolkata.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
              Search by intent, locality, and budget — with managed follow-up and no spam calls.
            </p>
          </div>

          <SmartSearchPanel />
          <TrustStrip />
        </div>
      </section>

      <BudgetShortcuts />

      <section className="bg-surface-elevated/40 py-8">
        <PopularLocationsSection items={POPULAR_LOCATIONS} />
      </section>

      <FeaturedListingsSection />
      <ConsolidatedBrowseSection />
      <HowItWorksSection />

      <OwnerListPropertyCta />
      <JoinBrokerNetworkCta />
    </main>
  );
}
