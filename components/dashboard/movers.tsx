"use client";
import { useApi } from "@/hooks/use-api";
import { Mover } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyLogo } from "./company-logo";
import { fmtMoney, fmtPct } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendingDown, TrendingUp } from "lucide-react";

function List({ items, kind }: { items: Mover[]; kind: "up" | "down" }) {
  if (!items?.length) return <div className="py-6 text-center text-sm text-muted-foreground">Nothing here yet.</div>;
  return (
    <ul className="divide-y divide-border/60">
      {items.map((m) => {
        const positive = (m.change_pct ?? 0) >= 0;
        return (
          <li key={m.ticker} className="flex items-center gap-3 py-2.5">
            <CompanyLogo ticker={m.ticker} name={m.name} src={m.logo} size={30} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{m.ticker}</div>
              <div className="text-xs text-muted-foreground truncate">{m.name}</div>
            </div>
            <div className="text-right num">
              <div className="text-sm">{fmtMoney(m.price)}</div>
              <div className={`text-xs inline-flex items-center gap-1 ${positive ? "text-bullish" : "text-bearish"}`}>
                {kind === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {fmtPct(m.change_pct)}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function MoversPanel() {
  const { data, isLoading, error } = useApi<Mover[] | { gainers: Mover[]; losers: Mover[] }>("/api/movers");

  const gainers = Array.isArray(data) ? data.filter((m) => (m.change_pct ?? 0) >= 0).sort((a, b) => (b.change_pct ?? 0) - (a.change_pct ?? 0)) : data?.gainers || [];
  const losers  = Array.isArray(data) ? data.filter((m) => (m.change_pct ?? 0) <  0).sort((a, b) => (a.change_pct ?? 0) - (b.change_pct ?? 0)) : data?.losers  || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Market Movers</CardTitle>
        <CardDescription>Top intraday performers</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>}
        {error && <div className="text-sm text-bearish">Couldn't load movers — {error.message}</div>}
        {!isLoading && !error && (
          <Tabs defaultValue="up">
            <TabsList>
              <TabsTrigger value="up">Gainers</TabsTrigger>
              <TabsTrigger value="down">Losers</TabsTrigger>
            </TabsList>
            <TabsContent value="up"><List items={gainers.slice(0, 6)} kind="up" /></TabsContent>
            <TabsContent value="down"><List items={losers.slice(0, 6)} kind="down" /></TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
