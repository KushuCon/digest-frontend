/**
 * Centralized API client.
 *
 * All requests go through Next.js rewrites (/api/* -> BACKEND_URL/api/*),
 * so the Render domain is never exposed to the browser.
 */

export type Article = {
  id: string | number;
  title: string;
  source?: string;
  url?: string;
  published_at?: string;
  excerpt?: string;
  summary?: string; // AI summary
  image?: string | null;
  tickers?: string[];
};

export type Source = { name: string; count?: number; logo?: string | null };

export type Holding = {
  ticker: string;
  name?: string;
  shares: number;
  buy_price: number;
  price?: number;
  change?: number;
  change_pct?: number;
  value?: number;
  pnl?: number;
  pnl_pct?: number;
  logo?: string | null;
};

export type Portfolio = {
  holdings: Holding[];
  total_value?: number;
  total_cost?: number;
  total_pnl?: number;
  total_pnl_pct?: number;
};

export type Stats = {
  articles_total?: number;
  articles_today?: number;
  sources_total?: number;
  last_updated?: string;
  [k: string]: any;
};

export type Mover = {
  ticker: string;
  name?: string;
  price: number;
  change: number;
  change_pct: number;
  logo?: string | null;
};

export type StockQuote = {
  ticker: string;
  name?: string;
  price: number;
  change?: number;
  change_pct?: number;
  history?: { t: string; c: number }[];
};

async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ""}`);
  }
  return (await res.json()) as T;
}

const q = (params: Record<string, string | number | undefined>) => {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && u.set(k, String(v)));
  const s = u.toString();
  return s ? `?${s}` : "";
};

export const api = {
  articles: (p: { page?: number; limit?: number; source?: string; hours?: number } = {}) =>
    j<{ items: Article[]; total: number; page: number; limit: number } | Article[]>(
      `/api/articles${q(p)}`,
    ),

  search: (p: { q: string; page?: number; limit?: number }) =>
    j<{ items: Article[]; total: number } | Article[]>(`/api/search${q(p)}`),

  sources: () => j<Source[] | { sources: Source[] }>(`/api/sources`),

  /**
   * NOTE: If the backend doesn't expose GET /api/portfolio, this throws.
   * The UI surfaces the mismatch in PortfolioPanel.
   */
  portfolio: () => j<Portfolio>(`/api/portfolio`),

  /**
   * Backend signature: POST /api/portfolio/update?ticker=&shares=&buy_price=&name=
   * `name` may be ignored server-side; UI marks it as frontend-only when that happens.
   */
  updateHolding: (p: { ticker: string; shares: number; buy_price: number; name?: string }) =>
    j<{ ok: boolean } & Record<string, unknown>>(`/api/portfolio/update${q(p)}`, { method: "POST" }),

  stats: () => j<Stats>(`/api/stats`),

  movers: () => j<Mover[] | { gainers: Mover[]; losers: Mover[] }>(`/api/movers`),

  stock: (ticker: string) => j<StockQuote>(`/api/stock/${encodeURIComponent(ticker)}`),

  trigger: (secret: string) => j<{ ok: boolean }>(`/api/trigger${q({ secret })}`, { method: "POST" }),
};

/** Normalize list-shaped endpoints that may return [] or { items: [] }. */
export function asList<T>(x: T[] | { items?: T[] } | undefined | null): T[] {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  if (Array.isArray((x as any).items)) return (x as any).items;
  return [];
}
