"use client";
import { useApi } from "@/hooks/use-api";
import { Article, Source, asList } from "@/lib/api";
import { ArticleCard, ArticleCardSkeleton } from "./article-card";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";

const HOURS = [
  { label: "1h", value: 1 },
  { label: "24h", value: 24 },
  { label: "7d", value: 24 * 7 },
  { label: "All", value: 0 },
];

export function Feed() {
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [source, setSource] = useState<string>("");
  const [hours, setHours] = useState<number>(24);

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (source) params.set("source", source);
  if (hours) params.set("hours", String(hours));

  const { data, isLoading, error } = useApi<{ items?: Article[]; total?: number } | Article[]>(
    `/api/articles?${params.toString()}`,
  );
  const { data: sourcesData } = useApi<Source[] | { sources: Source[] }>("/api/sources");

  const items = useMemo(() => asList<Article>(data as any), [data]);
  const sources = useMemo(() => asList<Source>(sourcesData as any), [sourcesData]);
  const total = (data as any)?.total ?? items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section aria-labelledby="feed-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 id="feed-heading" className="font-display text-2xl">Live Feed</h2>
        <div className="flex items-center gap-1 rounded-lg bg-secondary/60 p-1">
          {HOURS.map((h) => (
            <button
              key={h.value}
              onClick={() => { setHours(h.value); setPage(1); }}
              aria-pressed={hours === h.value}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                hours === h.value ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5 scroll-fade-mask">
          <button
            onClick={() => { setSource(""); setPage(1); }}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              source === "" ? "bg-primary/15 text-primary border-primary/30" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All sources
          </button>
          {sources.slice(0, 16).map((s) => (
            <button
              key={s.name}
              onClick={() => { setSource(s.name); setPage(1); }}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                source === s.name ? "bg-primary/15 text-primary border-primary/30" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.name}{typeof s.count === "number" ? ` · ${s.count}` : ""}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
        {error && !isLoading && (
          <div className="rounded-xl border border-bearish/30 bg-bearish/5 p-6 text-sm text-bearish">
            Couldn't load feed — {error.message}
          </div>
        )}
        {!isLoading && !error && items.length === 0 && (
          <div className="rounded-xl border border-border p-10 text-center">
            <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No articles match these filters.</p>
          </div>
        )}
        {items.map((a, i) => <ArticleCard key={String(a.id) + i} a={a} index={i} />)}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          Page <span className="num">{page}</span> of <span className="num">{totalPages}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
