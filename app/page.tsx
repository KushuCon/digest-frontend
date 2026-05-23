import { Hero } from "@/components/dashboard/hero";
import { StatsStrip } from "@/components/dashboard/stats-strip";
import { Feed } from "@/components/dashboard/feed";
import { PortfolioPanel } from "@/components/dashboard/portfolio-panel";
import { MoversPanel } from "@/components/dashboard/movers";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <Hero />
      <StatsStrip />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <Feed />
        <aside className="space-y-6">
          <PortfolioPanel />
          <MoversPanel />
        </aside>
      </div>
    </div>
  );
}
