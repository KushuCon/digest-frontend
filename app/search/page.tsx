"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { Article, asList } from "@/lib/api";
import { ArticleCard, ArticleCardSkeleton } from "@/components/dashboard/article-card";
import { Search as SearchIcon } from "lucide-react";

function SearchInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const initial = sp.get("q") || "";
  const [q, setQ] = useState(initial);
  const [page, setPage] = useState(1);

  useEffect(() => { setQ(initial); }, [initial]);

  const key = initial ? `/api/search?q=${encodeURIComponent(initial)}&page=${page}&limit=15` : null;
  const { data, isLoading, error } = useApi<{ items?: Article[] } | Article[]>(key);
  const items = asList<Article>(data as any);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Search</h1>
        <p className="text-muted-foreground mt-1">Find articles across every source.</p>
      </header>

      <form
        onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(q.trim())}`); setPage(1); }}
        className="flex gap-2"
        role="search"
      >
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Earnings, AI, oil, $TSLA…" className="pl-9 h-11" />
        </div>
        <Button type="submit" size="lg">Search</Button>
      </form>

      <div className="space-y-4">
        {!initial && <p className="text-sm text-muted-foreground">Type a query to begin.</p>}
        {initial && isLoading && Array.from({ length: 4 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
        {error && <div className="text-sm text-bearish">Search failed — {error.message}</div>}
        {initial && !isLoading && !error && items.length === 0 && (
          <div className="rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
            No results for "{initial}".
          </div>
        )}
        {items.map((a, i) => <ArticleCard key={String(a.id) + i} a={a} index={i} />)}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Loading…</div>}>
      <SearchInner />
    </Suspense>
  );
}
