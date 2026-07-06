"use client";

export function BrokerPropertyCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-card border border-border bg-white shadow-card">
      <div className="grid sm:grid-cols-[180px_1fr] lg:grid-cols-[240px_1fr]">
        <div className="h-44 bg-surface sm:h-full" />
        <div className="space-y-3 p-4">
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-pill bg-surface" />
            <div className="h-5 w-20 rounded-pill bg-surface" />
          </div>
          <div className="h-6 w-3/4 rounded bg-surface" />
          <div className="h-4 w-1/2 rounded bg-surface" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 rounded-btn bg-surface" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-9 rounded-btn bg-surface" />
            <div className="h-9 rounded-btn bg-surface" />
            <div className="h-9 rounded-btn bg-surface" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrokerRequirementCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-card border border-border bg-white shadow-card">
      <div className="grid lg:grid-cols-[1fr_220px]">
        <div className="space-y-3 p-5">
          <div className="flex gap-2">
            <div className="h-5 w-14 rounded-pill bg-surface" />
            <div className="h-5 w-24 rounded-pill bg-surface" />
          </div>
          <div className="h-6 w-full rounded bg-surface" />
          <div className="h-4 w-2/3 rounded bg-surface" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-12 rounded-btn bg-surface" />
            ))}
          </div>
        </div>
        <div className="border-t border-border bg-surface p-5 lg:border-l lg:border-t-0">
          <div className="mb-4 h-11 w-11 rounded-full bg-white" />
          <div className="space-y-2">
            <div className="h-9 rounded-btn bg-white" />
            <div className="h-9 rounded-btn bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrokerOverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-4 px-4 py-5 lg:px-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 rounded-card border border-border bg-white" />
        ))}
      </div>
      <div className="h-48 rounded-card border border-border bg-white" />
      <div className="h-64 rounded-card border border-border bg-white" />
    </div>
  );
}
