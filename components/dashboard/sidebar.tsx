"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Briefcase, Newspaper, Search, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Overview", icon: Activity },
  { href: "/feed", label: "News Feed", icon: Newspaper },
  // { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  // { href: "/movers", label: "Movers", icon: TrendingUp },
  // { href: "/search", label: "Search", icon: Search },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden lg:flex sticky top-0 h-dvh w-[240px] shrink-0 flex-col border-r border-border/60 bg-background/40 backdrop-blur-xl px-4 py-6">
      <Link href="/" className="flex items-center gap-2 px-2 mb-8" aria-label="Aperture Markets home">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary glow-primary">
          <Zap className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-lg">Aperture</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Markets · v2026</div>
        </div>
      </Link>

      <nav className="flex flex-col gap-1" aria-label="Primary">
        {items.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
              )}
            >
              {active && (
                <motion.span
                  layoutId="side-active"
                  className="absolute inset-0 -z-10 rounded-lg bg-secondary"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
