type QueryParamValue = string | number | boolean | undefined | null | string[];

type FetchJsonOptions = RequestInit & {
  params?: Record<string, QueryParamValue>;
};

function buildUrl(path: string, params?: FetchJsonOptions["params"]) {
  if (!params) return path;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.filter((item) => item !== "").forEach((item) => search.append(key, String(item)));
      return;
    }
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export async function fetchJson<T>(
  path: string,
  options: FetchJsonOptions = {}
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const { params, ...init } = options;
  const url = buildUrl(path, params);

  try {
    const res = await fetch(url, {
      credentials: "include",
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
    const data = (await res.json().catch(() => null)) as T | null;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export async function postJson<T>(path: string, body: unknown, init?: RequestInit) {
  return fetchJson<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...init,
  });
}
