"use client";
import { useApi } from "@/hooks/use-api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtNum, timeAgo } from "@/lib/utils";
import { Database, Newspaper, Radio, Clock } from "lucide-react";
import { useMemo } from "react";

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="h-8 w-8 rounded-md bg-primary/10 text-primary grid place-items-center">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl num">{value}</div>
    </Card>
  );
}

export function StatsStrip() {
  const { data: rawStats, isLoading } = useApi<any>("/api/stats");
  const { data: rawSources } = useApi<any>("/api/sources");

  const total     = rawStats?.total_articles ?? rawStats?.articles_total ?? null;
  const today     = rawStats?.today_articles ?? rawStats?.articles_today ?? null;
  const lastScrape = rawStats?.last_scrape ?? rawStats?.last_updated ?? null;
  const sourcesCount = useMemo(() => Array.isArray(rawSources) ? rawSources.length : null, [rawSources]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat label="Total articles" value={total !== null ? fmtNum(total) : "—"} icon={Newspaper} />
      <Stat label="Today"          value={today !== null ? fmtNum(today) : "—"} icon={Radio} />
      <Stat label="Sources"        value={sourcesCount !== null ? fmtNum(sourcesCount) : "—"} icon={Database} />
      <Stat label="Last updated"   value={lastScrape ? timeAgo(lastScrape) : "—"} icon={Clock} />
    </div>
  );
}