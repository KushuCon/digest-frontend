"use client";
import { Search, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

function LiveClock() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (tz: string) =>
    new Date().toLocaleTimeString("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="hidden md:flex items-center gap-3 font-mono text-xs select-none">
      <div className="flex flex-col items-center leading-tight">
        <span className="text-[9px] uppercase tracking-widest font-semibold text-green-400/70">IND</span>
        <span className="text-green-400 font-semibold tabular-nums">{fmt("Asia/Kolkata")}</span>
      </div>
      <span className="text-muted-foreground/30">·</span>
      <div className="flex flex-col items-center leading-tight">
        <span className="text-[9px] uppercase tracking-widest font-semibold text-blue-400/70">USA</span>
        <span className="text-blue-400 font-semibold tabular-nums">{fmt("America/New_York")}</span>
      </div>
      <span className="text-muted-foreground/30">·</span>
      <div className="flex flex-col items-center leading-tight">
        <span className="text-[9px] uppercase tracking-widest font-semibold text-red-400/70">UK</span>
        <span className="text-red-400 font-semibold tabular-nums">{fmt("Europe/London")}</span>
      </div>
    </div>
  );
}

export function Topbar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  return (
    <header className="sticky top-0 z-30 -mx-4 lg:mx-0 px-4 lg:px-8 py-3 border-b border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <form
          role="search"
          className="relative flex-1 max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles, tickers…"
            className="pl-9 h-9 bg-secondary/40 border-border/60"
            aria-label="Search"
          />
        </form>

        <LiveClock />

        <Button
          variant="ghost"
          size="icon"
          aria-label="Refresh data"
          disabled={refreshing}
          className="ml-auto"
          onClick={async () => {
            setRefreshing(true);
            try {
              const secret = process.env.NEXT_PUBLIC_TRIGGER_SECRET || "";
              await api.trigger(secret);
            } catch {}
            setTimeout(() => setRefreshing(false), 3000);
          }}
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </header>
  );
}