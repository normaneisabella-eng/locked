import { useListMyCheckins, useGetMyStats, useGetMyTrend } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function StatCard({ label, value, unit = "" }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5 text-center">
      <div className="font-display text-4xl text-primary mb-1">
        {value}{unit}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function timeAgo(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
    Overall: t.overall,
  }));

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-wide text-foreground mb-1">YOUR HISTORY</h1>
          <p className="text-muted-foreground text-sm">Track your mental performance patterns over time</p>
        </div>

        {/* Stats grid */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-card border border-card-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard label="Total Check-ins" value={stats.totalCheckins} />
            <StatCard label="Current Streak" value={stats.currentStreak} unit=" days" />
            <StatCard label="Longest Streak" value={stats.longestStreak} unit=" days" />
            <StatCard label="Avg Overall" value={stats.avgOverall} unit="/10" />
          </div>
        ) : null}

        {/* Averages */}
        {stats && stats.totalCheckins > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Avg Focus", value: stats.avgFocus, color: "hsl(var(--chart-1))" },
              { label: "Avg Confidence", value: stats.avgConfidence, color: "hsl(var(--chart-2))" },
              { label: "Avg Energy", value: stats.avgEnergy, color: "hsl(var(--chart-3))" },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-card-border rounded-xl p-4 text-center">
                <div className="font-display text-3xl mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Trend chart */}
        {!trendLoading && chartData.length > 1 && (
          <div className="bg-card border border-card-border rounded-xl p-5 mb-8">
            <h2 className="text-sm font-semibold text-foreground mb-4">30-day trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    fontSize: 12,
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Focus" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Confidence" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Energy" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Check-in history list */}
        <h2 className="text-sm font-semibold text-foreground mb-4">Recent check-ins</h2>
        {checkinsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card border border-card-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : checkins.length === 0 ? (
          <div className="text-center py-16">
            <div className="font-display text-5xl text-muted-foreground/30 mb-3">ZERO</div>
            <p className="text-muted-foreground text-sm">No check-ins yet. Start your streak today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {checkins.map((c) => {
              const overall = Math.round(((c.focusScore + c.confidenceScore + c.energyScore) / 3) * 10) / 10;
              return (
                <div
                  key={c.id}
                  data-testid={`card-checkin-${c.id}`}
                  className="bg-card border border-card-border rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{timeAgo(c.createdAt)}</div>
                      {c.note && (
                        <div className="text-xs text-muted-foreground italic mt-0.5 truncate max-w-xs">"{c.note}"</div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">F</div>
                        <div className="text-sm font-semibold" style={{ color: "hsl(var(--chart-1))" }}>{c.focusScore}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">C</div>
                        <div className="text-sm font-semibold" style={{ color: "hsl(var(--chart-2))" }}>{c.confidenceScore}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">E</div>
                        <div className="text-sm font-semibold" style={{ color: "hsl(var(--chart-3))" }}>{c.energyScore}</div>
                      </div>
                      <div className="text-center border-l border-border pl-3">
                        <div className="text-xs text-muted-foreground">Avg</div>
                        <div className="font-display text-base text-foreground">{overall}</div>
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
