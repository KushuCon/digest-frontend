"use client";
import { useApi } from "@/hooks/use-api";
import { normalizeMovers } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { fmtMoney, fmtPct } from "@/lib/utils";

function MoverRow({ m, isGainer }: { m: any; isGainer: boolean }) {
  const pct = m.change_pct ?? m.change ?? 0;
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
      <div>
        <div className="font-mono text-sm font-semibold">{m.ticker}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[130px]">{m.name}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-mono">{fmtMoney(m.price)}</div>
        <div className={`text-xs font-semibold font-mono ${isGainer ? "text-green-400" : "text-red-400"}`}>
          {isGainer ? "+" : ""}{fmtPct(pct)}
        </div>
      </div>
    </div>
  );
}

export function MoversPanel() {
  const { data: raw, isLoading } = useApi<any>("/api/movers");
  const { gainers, losers } = useMemo(() => normalizeMovers(raw), [raw]);

  if (isLoading) return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <span className="text-sm font-semibold text-green-400">Top Gainers</span>
        </div>
        {gainers.length === 0
          ? <p className="text-xs text-muted-foreground">No data available</p>
          : gainers.map((m: any) => <MoverRow key={m.ticker} m={m} isGainer={true} />)
        }
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="h-4 w-4 text-red-400" />
          <span className="text-sm font-semibold text-red-400">Top Losers</span>
        </div>
        {losers.length === 0
          ? <p className="text-xs text-muted-foreground">No data available</p>
          : losers.map((m: any) => <MoverRow key={m.ticker} m={m} isGainer={false} />)
        }
      </Card>
    </div>
  );
}