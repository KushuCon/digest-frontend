"use client";
import { motion } from "framer-motion";
import { Article } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink, Sparkles } from "lucide-react";
import { timeAgo } from "@/lib/utils";

function AISummary({ text }: { text: string }) {
  // Parse bullet points starting with •
  const lines = text.split("\n").filter((l) => l.trim().startsWith("•"));
  if (lines.length === 0) {
    // fallback — plain text
    return <p className="text-sm text-foreground/90 leading-relaxed">{text}</p>;
  }
  return (
    <ul className="space-y-2">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed">
          <span className="text-primary mt-0.5 shrink-0">•</span>
          <span className="text-foreground/90">{line.replace(/^•\s*/, "").trim()}</span>
        </li>
      ))}
    </ul>
  );
}

export function ArticleCard({ a, index = 0 }: { a: Article; index?: number }) {
  const hasAI = !!a.summary && a.summary.length > 10;
  const hasImage = !!a.image;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -2 }}
    >
      <Card className="group overflow-hidden hover:border-primary/30 transition-colors">
        <div className="p-5 flex flex-col gap-3">
          {/* Header row */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {a.source && (
              <Badge variant="outline" className="font-medium text-xs">
                {a.source}
              </Badge>
            )}
            <span>·</span>
            <time dateTime={a.published_at || ""}>{timeAgo(a.published_at)}</time>
          </div>

          {/* Title */}
          {a.title && (
            <h3 className="text-lg font-semibold leading-snug text-balance group-hover:text-primary transition-colors">
              {a.url ? (
                <a href={a.url} target="_blank" rel="noreferrer noopener">
                  {a.title}
                </a>
              ) : (
                a.title
              )}
            </h3>
          )}

          {/* AI Summary — show if available, else show excerpt */}
          {hasAI ? (
            <div className="rounded-lg border border-primary/15 bg-primary/5 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI Summary
              </div>
              <AISummary text={a.summary!} />
            </div>
          ) : a.excerpt ? (
            <p className="text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>
          ) : null}

          {/* Image — full width below content */}
          {hasImage && (
            <div className="mt-1 rounded-lg overflow-hidden border border-border/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.image!}
                alt=""
                className="w-full object-contain max-h-[420px]"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 mt-1">
            {a.url && (
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Open original <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </Card>
    </motion.article>
  );
}

export function ArticleCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-5 space-y-3">
        <div className="skeleton h-3 w-32 rounded" />
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
      </div>
    </Card>
  );
}