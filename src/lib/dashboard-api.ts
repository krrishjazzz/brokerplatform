export type DashboardFetchResult<T> = {
  data?: T;
  error?: string;
  status?: number;
};

export async function dashboardFetch<T>(
  url: string,
  init?: RequestInit
): Promise<DashboardFetchResult<T>> {
  try {
    const res = await fetch(url, {
      credentials: "include",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    const text = await res.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        return {
          error: "Server returned an invalid response. Please try again.",
          status: res.status,
        };
      }
    }

    if (res.status === 401) {
      return {
        error: "Please sign in again to continue.",
        status: 401,
      };
    }

    if (res.status === 403) {
      const msg =
        typeof body === "object" && body && "error" in body && typeof (body as { error: unknown }).error === "string"
          ? (body as { error: string }).error
          : "You do not have permission for this action.";
      return { error: msg, status: 403 };
    }

    if (!res.ok) {
      const msg =
        typeof body === "object" && body && "error" in body && typeof (body as { error: unknown }).error === "string"
          ? (body as { error: string }).error
          : res.status >= 500
          ? "Server error. Please try again in a moment."
          : "Request failed. Please try again.";
      return { error: msg, status: res.status };
    }

    return { data: body as T, status: res.status };
  } catch {
    return { error: "Network error. Check your connection and try again." };
  }
}
