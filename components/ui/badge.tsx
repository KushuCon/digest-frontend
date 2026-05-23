import { cn } from "@/lib/utils";
import * as React from "react";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "outline" | "bull" | "bear" | "muted" }) {
  const styles = {
    default: "bg-primary/15 text-primary border-primary/20",
    outline: "border-border text-foreground",
    bull: "bg-bullish/15 text-bullish border-bullish/25",
    bear: "bg-bearish/15 text-bearish border-bearish/25",
    muted: "bg-muted text-muted-foreground border-transparent",
  }[variant];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles,
        className,
      )}
      {...props}
    />
  );
}
