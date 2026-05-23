"use client";
import { useApi } from "@/hooks/use-api";
import { Stats } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtNum, timeAgo } from "@/lib/utils";
import { motion } from "framer-motion";
import { Database, Newspaper, Radio, Clock } from "lucide-react";

const Stat = ({
  label, value, icon: Icon, hint,
}: { label: string; value: string; icon: any; hint?: string }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="h-8 w-8 rounded-md bg-primary/10 text-primary grid place-items-center">
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className="mt-3 font-display text-3xl num">{value}</div>
    {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
  </Card>
);

export function StatsStrip() {
  const { data, isLoading, error } = useApi<Stats>("/api/stats");

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }
  if (error) {
    return (
      <Card className="p-5 border-bearish/30">
        <div className="text-sm text-bearish">Failed to load stats — {error.message}</div>
      </Card>
    );
  }
  const s = data || {};
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.05 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <Stat label="Total articles"  value={fmtNum(s.articles_total)}  icon={Newspaper} />
      <Stat label="Today"           value={fmtNum(s.articles_today)}  icon={Radio} />
      <Stat label="Sources"         value={fmtNum(s.sources_total)}   icon={Database} />
      <Stat label="Last updated"    value={timeAgo(s.last_updated) || "—"} icon={Clock} hint={s.last_updated || ""} />
    </motion.div>
  );
}
