export type TrackablePropertyMetric = "VIEW" | "SEARCH_IMPRESSION" | "CLICK";

export function trackPropertyMetric(slug: string, event: TrackablePropertyMetric) {
  if (!slug || typeof window === "undefined") return;

  if (event === "VIEW") {
    const key = `kj_metric_view_${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // ignore storage errors
    }
  }

  void fetch(`/api/properties/${slug}/metrics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
    keepalive: true,
  }).catch(() => {
    // non-blocking analytics
  });
}
