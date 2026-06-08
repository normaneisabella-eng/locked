import { useState } from "react";
import { useGetCommunityFeed, getGetCommunityFeedQueryKey } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";

const GREEN = "#00e5a0";

const SPORTS = [
  "All",
  "Basketball", "Soccer", "Football", "Baseball", "Tennis",
  "Swimming", "Track & Field", "CrossFit", "MMA", "Gymnastics",
  "Volleyball", "Cycling", "Hockey", "Rowing", "Wrestling",
  "Golf", "Rugby", "Lacrosse", "Other",
];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ScoreDot({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: i < value ? GREEN : "#222",
          }}
        />
      ))}
    </div>
  );
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
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-7">
          <div style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.18em" }} className="text-xs font-semibold uppercase mb-2">
            Anonymous
          </div>
          <h1
            style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}
            className="text-5xl font-black uppercase text-white"
          >
            Community <span style={{ color: GREEN }}>Feed</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-sm mt-2 font-light">
            Real minds. No names. Just athletes being honest.
          </p>
        </div>

        {/* Sport filter strip */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-7" style={{ scrollbarWidth: "none" }}>
          {SPORTS.map((s) => (
            <button
              key={s}
              data-testid={`button-filter-${s}`}
              onClick={() => setSelectedSport(s)}
              style={{
                flexShrink: 0,
                background: selectedSport === s ? GREEN : "#111",
                border: `1px solid ${selectedSport === s ? GREEN : "#222"}`,
                color: selectedSport === s ? "#0a0a0a" : "rgba(255,255,255,0.4)",
                borderRadius: "999px",
                padding: "5px 14px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                fontFamily: "'Barlow', sans-serif",
                transition: "all 0.15s",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", height: "100px" }} className="animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <div
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "rgba(255,255,255,0.08)" }}
              className="text-7xl font-black uppercase mb-4"
            >
              Quiet
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)" }} className="text-sm">
              No check-ins yet for {selectedSport === "All" ? "your community" : selectedSport}.
              <br />Be the first today.
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
                  style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }}
                  className="p-5 hover:border-[#00e5a0]/20 transition-colors"
                >
                  {/* Row 1: sport tag + time + overall */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          background: "#1a1a1a",
                          border: "1px solid #2a2a2a",
                          color: GREEN,
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.sport}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>{timeAgo(item.createdAt)}</span>
                    </div>

                    {/* Scores */}
                    <div className="flex items-center gap-4">
                      {[
                        { label: "Focus", value: item.focusScore },
                        { label: "Conf", value: item.confidenceScore },
                        { label: "Energy", value: item.energyScore },
                      ].map((s) => (
                        <div key={s.label} className="flex flex-col items-center">
                          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</span>
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "rgba(255,255,255,0.7)", fontSize: "16px", fontWeight: 700, lineHeight: 1 }}>
                            {s.value}
                          </span>
                        </div>
                      ))}
                      <div style={{ borderLeft: "1px solid #2a2a2a" }} className="pl-3 flex flex-col items-center">
                        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Avg</span>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: GREEN, fontSize: "18px", fontWeight: 800, lineHeight: 1 }}>
                          {overall}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  {item.note && (
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", fontStyle: "italic" }}>
                      "{item.note}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
