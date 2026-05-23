import { PortfolioPanel } from "@/components/dashboard/portfolio-panel";

export const metadata = { title: "Portfolio — Aperture" };

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Portfolio</h1>
        <p className="text-muted-foreground mt-1">Track value, P&L, and per-holding performance.</p>
      </header>
      <PortfolioPanel />
    </div>
  );
}
