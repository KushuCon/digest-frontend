/**
 * Centralized API client — fixed for FastAPI backend response shapes.
 */

export type Article = {
  id: string | number;
  title?: string;
  content?: string;
  source_name?: string;
  source?: string;
  source_url?: string;
  url?: string;
  published_at?: string;
  scraped_at?: string;
  excerpt?: string;
  summary?: string;
  ai_summary?: string;
  image?: string | null;
  image_url?: string | null;
  source_type?: string;
  tickers?: string[];
};

export type Source = { name: string; source_name?: string; count?: number; logo?: string | null };

export type Stats = {
  articles_total?: number;
  articles_today?: number;
  today_articles?: number;
  total_articles?: number;
  sources_total?: number;
  last_updated?: string;
  last_scrape?: string;
  [k: string]: any;
};

export type Mover = {
  ticker: string;
  name?: string;
  price: number;
  change: number;
  change_pct?: number;
  logo?: string | null;
};

export type StockQuote = {
  ticker: string;
  name?: string;
  price: number;
  change?: number;
  change_pct?: number;
};

export type Holding = {
  ticker: string;
  name?: string;
  logo?: string | null;
  price?: number;
  change_pct?: number;
  shares?: number;
  buy_price?: number;
  value?: number;
  pnl?: number;
  pnl_pct?: number;
};

export type Portfolio = {
  holdings?: Holding[];
  total_value?: number;
  total_cost?: number;
  total_pnl?: number;
  total_pnl_pct?: number;
  [k: string]: any;
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
    j<any>(`/api/articles${q(p)}`),

  search: (p: { q: string; page?: number; limit?: number }) =>
    j<any>(`/api/search${q(p)}`),

  sources: () => j<any>(`/api/sources`),

  stats: () => j<Stats>(`/api/stats`),

  movers: () => j<any>(`/api/movers`),

  stock: (ticker: string) => j<StockQuote>(`/api/stock/${encodeURIComponent(ticker)}`),

  updateHolding: (p: { ticker: string; shares: number; buy_price: number; name?: string }) =>
    j<any>(`/api/portfolio/update${q(p)}`, { method: "POST" }),

  trigger: (secret: string) => j<{ ok: boolean }>(`/api/trigger${q({ secret })}`, { method: "POST" }),
};

/** Normalize articles from FastAPI response */
export function asList<T>(x: any): T[] {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  // FastAPI returns { articles: [], pagination: {} }
  if (Array.isArray(x.articles)) return x.articles;
  // Also handle { items: [] }
  if (Array.isArray(x.items)) return x.items;
  return [];
}

/** Normalize article fields from FastAPI to frontend shape */
export function normalizeArticle(a: any): Article {
  return {
    ...a,
    title: a.title || a.content?.slice(0, 100) || "Untitled",
    source: a.source_name || a.source || "Unknown",
    url: a.source_url || a.url || "",
    published_at: a.scraped_at || a.published_at || "",
    excerpt: a.content || a.excerpt || "",
    summary: a.ai_summary || a.summary || "",
    image: a.image_url || a.image || null,
  };
}

/** Normalize sources from FastAPI */
export function normalizeSources(x: any): Source[] {
  if (!x) return [];
  if (Array.isArray(x)) {
    return x.map((s: any) => ({
      name: s.source_name || s.name || "",
      count: s.count,
    }));
  }
  return [];
}

/** Normalize stats from FastAPI */
export function normalizeStats(s: any): Stats {
  if (!s) return {};
  return {
    articles_total: s.total_articles ?? s.articles_total,
    articles_today: s.today_articles ?? s.articles_today,
    sources_total: s.sources_total,
    last_updated: s.last_scrape ?? s.last_updated,
  };
}

/** Normalize movers */
export function normalizeMovers(x: any): { gainers: Mover[]; losers: Mover[] } {
  if (!x) return { gainers: [], losers: [] };
  if (Array.isArray(x)) return { gainers: x, losers: [] };
  return {
    gainers: (x.gainers || []).map((m: any) => ({ ...m, change_pct: m.change ?? m.change_pct })),
    losers: (x.losers || []).map((m: any) => ({ ...m, change_pct: m.change ?? m.change_pct })),
  };
}

/** Pagination from FastAPI */
export function getPagination(x: any, limit: number) {
  if (!x) return { total: 0, pages: 1 };
  const total = x.pagination?.total ?? x.total ?? 0;
  const pages = x.pagination?.pages ?? Math.max(1, Math.ceil(total / limit));
  return { total, pages };
}