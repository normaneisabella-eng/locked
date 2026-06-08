import { useListMyCheckins, useGetMyStats, useGetMyTrend } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const GREEN = "#00e5a0";

function StatCard({ label, value, unit = "" }: { label: string; value: number | string; unit?: string }) {
  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }} className="p-5 text-center">
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: GREEN }} className="text-4xl font-black mb-1">
        {value}{unit}
      </div>
      <div style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }} className="text-xs font-semibold uppercase">
        {label}
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function History() {
  const { data: checkinsData, isLoading: checkinsLoading } = useListMyCheckins({ limit: 30, page: 1 });
  const { data: stats, isLoading: statsLoading } = useGetMyStats();
  const { data: trend, isLoading: trendLoading } = useGetMyTrend();

  const checkins = checkinsData?.checkins ?? [];

  const chartData = (trend ?? []).map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Focus: t.focusScore,
    Confidence: t.confidenceScore,
    Energy: t.energyScore,
  }));

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.18em" }} className="text-xs font-semibold uppercase mb-2">
            Your data
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }} className="text-5xl font-black uppercase text-white">
            Mental <span style={{ color: GREEN }}>History</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-sm mt-2 font-light">
            Track your patterns. Find your edge.
          </p>
        </div>

        {/* Stats grid */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", height: "90px" }} className="animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard label="Check-ins" value={stats.totalCheckins} />
            <StatCard label="Streak" value={stats.currentStreak} unit="d" />
            <StatCard label="Best streak" value={stats.longestStreak} unit="d" />
            <StatCard label="Avg Overall" value={stats.avgOverall} unit="/10" />
          </div>
        ) : null}

        {/* Per-metric averages */}
        {stats && stats.totalCheckins > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Focus", value: stats.avgFocus },
              { label: "Confidence", value: stats.avgConfidence },
              { label: "Energy", value: stats.avgEnergy },
            ].map((s) => (
              <div key={s.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }} className="p-4 text-center">
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: GREEN }} className="text-3xl font-black mb-1">
                  {s.value}
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }} className="text-xs font-semibold uppercase">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trend chart */}
        {!trendLoading && chartData.length > 1 && (
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px" }} className="p-6 mb-8">
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }} className="text-sm font-bold uppercase text-white mb-5">
              30-Day Trend
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -24, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)", fontFamily: "'Barlow', sans-serif" }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)", fontFamily: "'Barlow', sans-serif" }} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "10px",
                    color: "white",
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: 12,
                  }}
                  cursor={{ stroke: "#2a2a2a" }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Barlow', sans-serif" }}
                />
                <Line type="monotone" dataKey="Focus" stroke={GREEN} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Confidence" stroke="#60a5fa" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Energy" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* History list */}
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }} className="text-sm font-bold uppercase text-white mb-4">
          Recent Check-Ins
        </div>

        {checkinsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", height: "72px" }} className="animate-pulse" />
            ))}
          </div>
        ) : checkins.length === 0 ? (
          <div className="text-center py-16">
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "rgba(255,255,255,0.07)" }} className="text-7xl font-black uppercase mb-3">
              Zero
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)" }} className="text-sm">No check-ins yet. Start your streak today.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {checkins.map((c) => {
              const overall = Math.round(((c.focusScore + c.confidenceScore + c.energyScore) / 3) * 10) / 10;
              return (
                <div
                  key={c.id}
                  data-testid={`card-checkin-${c.id}`}
                  style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px" }}
                  className="px-5 py-4 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white">{formatDate(c.createdAt)}</div>
                    {c.note && (
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }} className="italic mt-0.5 truncate max-w-xs">
                        "{c.note}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {[
                      { k: "F", v: c.focusScore, color: GREEN },
                      { k: "C", v: c.confidenceScore, color: "#60a5fa" },
                      { k: "E", v: c.energyScore, color: "#f59e0b" },
                    ].map((s) => (
                      <div key={s.k} className="text-center">
                        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", letterSpacing: "0.08em" }} className="uppercase">{s.k}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: s.color, fontSize: "18px", fontWeight: 700, lineHeight: 1 }}>
                          {s.v}
                        </div>
                      </div>
                    ))}
                    <div style={{ borderLeft: "1px solid #2a2a2a" }} className="pl-4 text-center">
                      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", letterSpacing: "0.08em" }} className="uppercase">Avg</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "rgba(255,255,255,0.7)", fontSize: "18px", fontWeight: 700, lineHeight: 1 }}>
                        {overall}
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
