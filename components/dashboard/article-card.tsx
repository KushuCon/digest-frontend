"use client";
import { motion } from "framer-motion";
import { Article } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink, Sparkles } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export function ArticleCard({ a, index = 0 }: { a: Article; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -2 }}
    >
      <Card className="group overflow-hidden hover:border-primary/30 transition-colors">
        <div className="grid md:grid-cols-[1fr_240px] gap-0">
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {a.source && <Badge variant="muted" className="font-medium">{a.source}</Badge>}
              <span>·</span>
              <time dateTime={a.published_at || ""}>{timeAgo(a.published_at)}</time>
              {a.tickers?.slice(0, 3).map((t) => (
                <Badge key={t} variant="outline" className="ml-auto">${t}</Badge>
              ))}
            </div>
            <h3 className="text-lg font-semibold leading-snug text-balance group-hover:text-primary transition-colors">
              {a.url ? (
                <a href={a.url} target="_blank" rel="noreferrer noopener" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  {a.title}
                </a>
              ) : a.title}
            </h3>
            {a.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>}
            {a.summary && (
              <div className="mt-1 rounded-lg border border-primary/15 bg-primary/5 p-3 text-sm">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> AI summary
                </div>
                <p className="text-foreground/90 leading-relaxed">{a.summary}</p>
              </div>
            )}
            <div className="mt-auto pt-2">
              {a.url && (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
                >
                  Open original <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          {a.image ? (
            <div className="relative hidden md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/30" />
            </div>
          ) : (
            <div className="relative hidden md:block bg-gradient-to-br from-secondary/60 to-secondary/20" />
          )}
        </div>
      </Card>
    </motion.article>
  );
}

export function ArticleCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-[1fr_240px]">
        <div className="p-5 space-y-3">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
        </div>
        <div className="skeleton hidden md:block h-full min-h-[160px]" />
      </div>
    </Card>
  );
}
