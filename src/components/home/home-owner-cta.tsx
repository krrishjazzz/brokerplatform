import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

export function HomeOwnerCta() {
  return (
    <section className="bg-surface py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Building2 size={24} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-foreground">Own a property?</h2>
              <p className="mt-1 max-w-lg text-sm text-text-secondary">
                List free with KrrishJazz managed enquiries. Pay brokerage only on successful closure.
              </p>
            </div>
          </div>
          <Link
            href="/owners"
            className="inline-flex shrink-0 items-center gap-2 rounded-btn border border-primary/25 bg-primary-light px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            List your property
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
