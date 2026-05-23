"use client";
import { useApi } from "@/hooks/use-api";
import { Holding, Portfolio, api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "./company-logo";
import { Edit3, Eye, EyeOff, Save, TrendingDown, TrendingUp, X } from "lucide-react";
import { fmtMoney, fmtPct } from "@/lib/utils";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

function Row({ h, editing, onSave }: {
  h: Holding;
  editing: boolean;
  onSave: (next: { shares: number; buy_price: number; name?: string }) => Promise<void>;
}) {
  const [shares, setShares] = useState(String(h.shares ?? 0));
  const [buy, setBuy] = useState(String(h.buy_price ?? 0));
  const [name, setName] = useState(h.name ?? "");
  const [saving, setSaving] = useState(false);

  const value = h.value ?? (h.price ?? 0) * (h.shares ?? 0);
  const pnl = h.pnl ?? ((h.price ?? 0) - (h.buy_price ?? 0)) * (h.shares ?? 0);
  const pnlPct = h.pnl_pct ?? (h.buy_price ? ((h.price ?? 0) / h.buy_price - 1) * 100 : 0);
  const positive = pnl >= 0;

  return (
    <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1.4fr_1fr_1fr_auto] items-center gap-3 py-3 border-b border-border/60 last:border-0">
      <CompanyLogo ticker={h.ticker} name={h.name} src={h.logo} size={36} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{h.ticker}</span>
          {editing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-7 text-xs w-40"
              aria-label={`${h.ticker} name`}
              placeholder="Display name (UI)"
            />
          ) : (
            <span className="text-sm text-muted-foreground truncate">{h.name || ""}</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground num">
          {editing ? (
            <span className="inline-flex items-center gap-2 mt-1">
              <Input value={shares} onChange={(e) => setShares(e.target.value)} className="h-7 w-20 text-xs" aria-label="Shares" />
              <span>×</span>
              <Input value={buy} onChange={(e) => setBuy(e.target.value)} className="h-7 w-24 text-xs" aria-label="Buy price" />
            </span>
          ) : (
            <>{h.shares} × {fmtMoney(h.buy_price)}</>
          )}
        </div>
      </div>
      <div className="hidden sm:block text-right num">
        <div className="text-sm">{fmtMoney(h.price)}</div>
        <div className={`text-xs ${(h.change_pct ?? 0) >= 0 ? "text-bullish" : "text-bearish"}`}>
          {fmtPct(h.change_pct)}
        </div>
      </div>
      <div className="hidden sm:block text-right num">
        <div className="text-sm">{fmtMoney(value)}</div>
        <div className={`text-xs inline-flex items-center gap-1 ${positive ? "text-bullish" : "text-bearish"}`}>
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {fmtMoney(pnl)} · {fmtPct(pnlPct)}
        </div>
      </div>
      <div className="text-right">
        {editing && (
          <Button
            size="sm"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave({
                  shares: Number(shares),
                  buy_price: Number(buy),
                  name: name || undefined,
                });
              } finally {
                setSaving(false);
              }
            }}
          >
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        )}
      </div>
    </div>
  );
}

export function PortfolioPanel() {
  const { data, isLoading, error } = useApi<Portfolio>("/api/portfolio");
  const [editing, setEditing] = useState(false);
  const [hidden, setHidden] = useState(false);

  const totals = useMemo(() => {
    if (!data) return { value: 0, pnl: 0, pct: 0 };
    const value = data.total_value ?? (data.holdings || []).reduce((s, h) => s + (h.value ?? (h.price ?? 0) * (h.shares ?? 0)), 0);
    const cost  = data.total_cost  ?? (data.holdings || []).reduce((s, h) => s + (h.buy_price ?? 0) * (h.shares ?? 0), 0);
    const pnl   = data.total_pnl   ?? value - cost;
    const pct   = data.total_pnl_pct ?? (cost ? (value / cost - 1) * 100 : 0);
    return { value, pnl, pct };
  }, [data]);

  const mask = (s: string) => (hidden ? s.replace(/[0-9.,$]/g, "•") : s);

  const backendMissing = error && /404|405/.test(error.message);

  async function save(ticker: string, next: { shares: number; buy_price: number; name?: string }) {
    try {
      await api.updateHolding({ ticker, ...next });
      toast.success(`Updated ${ticker}`, {
        description: next.name ? "Note: backend may ignore the `name` field." : undefined,
      });
      mutate("/api/portfolio");
    } catch (e: any) {
      toast.error(`Update failed`, { description: e?.message });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="font-display text-xl">Portfolio</CardTitle>
            <CardDescription>Live valuation across your holdings</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <Switch checked={hidden} onCheckedChange={setHidden} aria-label="Privacy mode" />
            </label>
            <Button variant={editing ? "secondary" : "outline"} size="sm" onClick={() => setEditing((v) => !v)}>
              {editing ? <><X className="h-3.5 w-3.5" /> Done</> : <><Edit3 className="h-3.5 w-3.5" /> Edit</>}
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total value</div>
            <div className="font-display text-3xl num">{mask(fmtMoney(totals.value))}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">P&L</div>
            <div className={`font-display text-3xl num ${totals.pnl >= 0 ? "text-bullish" : "text-bearish"}`}>
              {mask(fmtMoney(totals.pnl))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Return</div>
            <Badge variant={totals.pnl >= 0 ? "bull" : "bear"} className="text-base px-3 py-1 num">
              {fmtPct(totals.pct)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        )}

        {backendMissing && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-400">Backend mismatch:</strong> the API does not expose
            <code className="mx-1 px-1.5 py-0.5 bg-secondary rounded">GET /api/portfolio</code>.
            Add the route in FastAPI to enable this panel.
          </div>
        )}

        {error && !backendMissing && (
          <div className="text-sm text-bearish">Failed to load portfolio — {error.message}</div>
        )}

        {!isLoading && !error && (data?.holdings?.length ?? 0) === 0 && (
          <div className="text-center py-10 text-sm text-muted-foreground">
            No holdings yet. Use Edit to add positions via the API.
          </div>
        )}

        <div className="divide-y divide-border/60">
          {(data?.holdings || []).map((h) => (
            <Row key={h.ticker} h={h} editing={editing} onSave={(n) => save(h.ticker, n)} />
          ))}
        </div>

        {editing && (
          <p className="mt-4 text-[11px] text-muted-foreground">
            The <strong>name</strong> field is sent to <code>POST /api/portfolio/update</code>; if your backend ignores it,
            it remains a frontend-only label.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
