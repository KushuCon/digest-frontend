"use client";
import { useApi } from "@/hooks/use-api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyLogo } from "./company-logo";
import { fmtMoney, fmtPct } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

type Mover = { ticker: string; name?: string; price: number; change?: number; change_pct?: number; logo?: string | null };

function normalize(raw: any): { gainers: Mover[]; losers: Mover[] } {
  if (!raw) return { gainers: [], losers: [] };
  const g: Mover[] = (raw.gainers || []).map((m: any) => ({
    ...m,
    change_pct: m.change_pct ?? m.change ?? 0,
  }));
  const l: Mover[] = (raw.losers || []).map((m: any) => ({
    ...m,
    change_pct: m.change_pct ?? m.change ?? 0,
  }));
  return { gainers: g, losers: l };
}

function MoverRow({ m, isGainer }: { m: Mover; isGainer: boolean }) {
  const pct = m.change_pct ?? 0;
  return (
    <li className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
      <CompanyLogo ticker={m.ticker} name={m.name} src={m.logo} size={30} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold font-mono">{m.ticker}</div>
        <div className="text-xs text-muted-foreground truncate">{m.name}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-mono">{fmtMoney(m.price)}</div>
        <div className={`text-xs font-semibold font-mono flex items-center justify-end gap-1 ${isGainer ? "text-green-400" : "text-red-400"}`}>
          {isGainer ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isGainer ? "+" : ""}{fmtPct(pct)}
        </div>
      </div>
    </li>
  );
}

export function MoversPanel() {
  const { data: raw, isLoading, error } = useApi<any>("/api/movers");
  const { gainers, losers } = normalize(raw);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Market Movers</CardTitle>
        <CardDescription>Top intraday performers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        )}
        {error && <div className="text-sm text-red-400">Couldn't load movers</div>}
        {!isLoading && !error && (
          <>
            {/* Gainers */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400 mb-1">
                <TrendingUp className="h-3.5 w-3.5" /> Gainers
              </div>
              <ul>
                {gainers.length === 0
                  ? <li className="text-xs text-muted-foreground py-2">No data</li>
                  : gainers.map((m) => <MoverRow key={m.ticker} m={m} isGainer={true} />)
                }
              </ul>
            </div>

            {/* Losers */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mb-1 mt-2">
                <TrendingDown className="h-3.5 w-3.5" /> Losers
              </div>
              <ul>
                {losers.length === 0
                  ? <li className="text-xs text-muted-foreground py-2">No data</li>
                  : losers.map((m) => <MoverRow key={m.ticker} m={m} isGainer={false} />)
                }
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}