"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Briefcase, Newspaper, TrendingUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Overview", icon: Activity },
  { href: "/feed", label: "Feed", icon: Newspaper },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/movers", label: "Movers", icon: TrendingUp },
  { href: "/search", label: "Search", icon: Search },
];

export function MobileNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Primary mobile"
      className="lg:hidden fixed bottom-3 inset-x-3 z-40 glass rounded-2xl p-2 grid grid-cols-5 gap-1"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px]",
              active ? "bg-secondary text-foreground" : "text-muted-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
