import { Feed } from "@/components/dashboard/feed";

export const metadata = { title: "News Feed — Aperture" };

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">News Feed</h1>
        <p className="text-muted-foreground mt-1">All articles, filtered by source and recency.</p>
      </header>
      <Feed />
    </div>
  );
}
