"use client";
import { useState } from "react";
import { cn, initials } from "@/lib/utils";

/**
 * Renders a company logo with graceful fallback to a colored ticker chip.
 * Tries explicit `src`, then a free logo CDN, then falls back to initials.
 */
export function CompanyLogo({
  ticker, name, src, size = 32, className,
}: { ticker: string; name?: string; src?: string | null; size?: number; className?: string }) {
  const [stage, setStage] = useState<0 | 1 | 2>(src ? 0 : 1);
  const sources = [
    src || "",
    `https://logo.clearbit.com/${(name || ticker).toLowerCase().replace(/\s+/g, "")}.com`,
  ];
  const url = sources[stage];

  if (stage >= 2 || !url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-primary/5 text-[10px] font-semibold text-primary",
          className,
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {initials(name || ticker)}
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      className={cn("rounded-md bg-white/5 object-contain p-0.5", className)}
      onError={() => setStage((s) => (s + 1) as 0 | 1 | 2)}
      loading="lazy"
    />
  );
}
