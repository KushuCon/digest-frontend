import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60dvh] grid place-items-center text-center px-6">
      <div>
        <div className="font-display text-7xl text-primary">404</div>
        <p className="mt-2 text-muted-foreground">This page slipped through the cracks.</p>
        <Button asChild className="mt-6"><Link href="/">Back to overview</Link></Button>
      </div>
    </div>
  );
}
