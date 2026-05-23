import { MoversPanel } from "@/components/dashboard/movers";

export const metadata = { title: "Movers — Aperture" };

export default function MoversPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Market Movers</h1>
        <p className="text-muted-foreground mt-1">Today's biggest gainers and losers.</p>
      </header>
      <MoversPanel />
    </div>
  );
}
