import { useState } from "react";
import { useGetCommunityFeed, getGetCommunityFeedQueryKey } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";

const SPORTS = [
  "All",
  "Basketball", "Soccer", "Football", "Baseball", "Tennis",
  "Swimming", "Track & Field", "CrossFit", "MMA", "Gymnastics",
  "Volleyball", "Cycling", "Hockey", "Rowing", "Wrestling",
  "Golf", "Rugby", "Lacrosse", "Other",
];

function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground mb-0.5">{label}</span>
      <span className="font-display text-lg leading-none" style={{ color }}>{value}</span>
    </div>
  );
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Feed() {
  const [selectedSport, setSelectedSport] = useState("All");

  const { data, isLoading } = useGetCommunityFeed(
    selectedSport !== "All" ? { sport: selectedSport } : undefined,
    {
      query: {
        queryKey: getGetCommunityFeedQueryKey(selectedSport !== "All" ? { sport: selectedSport } : undefined),
      },
    },
  );

  const items = data?.items ?? [];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-4xl tracking-wide text-foreground mb-1">COMMUNITY</h1>
          <p className="text-muted-foreground text-sm">Anonymous check-ins from athletes in your sport</p>
        </div>

        {/* Sport filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {SPORTS.map((s) => (
            <button
              key={s}
              data-testid={`button-filter-${s}`}
              onClick={() => setSelectedSport(s)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                selectedSport === s
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-secondary border-border text-secondary-foreground hover:border-primary/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Feed items */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-card border border-card-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="font-display text-5xl text-muted-foreground/30 mb-3">QUIET</div>
            <p className="text-muted-foreground text-sm">
              No check-ins yet for {selectedSport === "All" ? "your community" : selectedSport}.
              <br />Be the first to check in today.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const overall = Math.round(((item.focusScore + item.confidenceScore + item.energyScore) / 3) * 10) / 10;
              return (
                <div
                  key={item.id}
                  data-testid={`card-feed-${item.id}`}
                  className="bg-card border border-card-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-secondary border border-border px-2 py-0.5 rounded-full text-secondary-foreground font-medium">
                          {item.sport}
                        </span>
                        <span className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
                      </div>
                      {item.note && (
                        <p className="text-sm text-foreground/80 italic truncate">"{item.note}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <ScorePill label="Focus" value={item.focusScore} color="hsl(var(--chart-1))" />
                      <ScorePill label="Conf" value={item.confidenceScore} color="hsl(var(--chart-2))" />
                      <ScorePill label="Energy" value={item.energyScore} color="hsl(var(--chart-3))" />
                      <div className="flex flex-col items-center border-l border-border pl-4">
                        <span className="text-xs text-muted-foreground mb-0.5">Avg</span>
                        <span className="font-display text-lg text-foreground">{overall}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
