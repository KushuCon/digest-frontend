"use client";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60dvh] grid place-items-center text-center px-6">
      <div className="max-w-md">
        <h1 className="font-display text-3xl">Something broke.</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={reset} className="mt-6">Try again</Button>
      </div>
    </div>
  );
}
