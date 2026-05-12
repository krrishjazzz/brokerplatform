type PaginationOptions = {
  defaultLimit?: number;
  maxLimit?: number;
};

function positiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getPagination(searchParams: URLSearchParams, options: PaginationOptions = {}) {
  const defaultLimit = options.defaultLimit ?? 12;
  const maxLimit = options.maxLimit ?? 50;
  const page = Math.max(1, positiveInt(searchParams.get("page"), 1));
  const limit = Math.min(maxLimit, Math.max(1, positiveInt(searchParams.get("limit"), defaultLimit)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
