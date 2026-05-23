"use client";
import { Search, Bell, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function Topbar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-30 -mx-4 lg:mx-0 px-4 lg:px-8 py-3 border-b border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <form
          role="search"
          className="relative flex-1 max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles, tickers, sources…"
            className="pl-9 h-10 bg-secondary/40 border-border/60"
            aria-label="Search"
          />
        </form>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Refresh data"
          onClick={async () => {
            const secret = process.env.NEXT_PUBLIC_TRIGGER_SECRET || "";
            try {
              await api.trigger(secret);
              toast.success("Refresh triggered");
            } catch (e: any) {
              toast.error("Refresh failed", { description: e?.message });
            }
          }}
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
