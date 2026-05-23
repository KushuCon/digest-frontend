"use client";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl glass p-8 md:p-12">
      <div className="absolute inset-0 -z-10 bg-grid-fade" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
          <Sparkles className="h-3 w-3" /> Live market intelligence
        </div>
        <h1 className="mt-4 font-display text-4xl md:text-6xl tracking-tight text-balance leading-[1.05]">
          The market, <span className="text-primary">interpreted</span>.
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground text-balance">
          A single canvas for your portfolio, the news that moves it, and the tickers worth your attention —
          curated by AI, refreshed continuously.
        </p>
      </motion.div>
    </section>
  );
}
