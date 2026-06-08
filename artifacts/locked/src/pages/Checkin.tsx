import { useState } from "react";
import {
  useGetTodayCheckin,
  useCreateCheckin,
  useGetMyStats,
  getGetTodayCheckinQueryKey,
  getGetMyStatsQueryKey,
  getGetMyTrendQueryKey,
  getListMyCheckinsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import NotificationBanner from "@/components/NotificationBanner";

function ScoreSlider({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="font-display text-3xl text-primary">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{sublabel}</p>
      <input
        data-testid={`slider-${label.toLowerCase()}`}
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary cursor-pointer"
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-semibold">{value}/10</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(value / 10) * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function Checkin() {
  const [focus, setFocus] = useState(7);
  const [confidence, setConfidence] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const queryClient = useQueryClient();
  const { data: todayData, isLoading } = useGetTodayCheckin();
  const { data: stats } = useGetMyStats();
  const createCheckin = useCreateCheckin();

  const todayCheckin = todayData?.checkin;

  const handleSubmit = () => {
    createCheckin.mutate(
      {
        data: {
          focusScore: focus,
          confidenceScore: confidence,
          energyScore: energy,
          note: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          queryClient.invalidateQueries({ queryKey: getGetTodayCheckinQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMyStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMyTrendQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListMyCheckinsQueryKey() });
        },
      },
    );
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-muted-foreground text-xs tracking-widest uppercase mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <h1 className="font-display text-4xl tracking-wide text-foreground">
            {todayCheckin ? "TODAY'S CHECK-IN" : "DAILY CHECK-IN"}
          </h1>
          {stats && (
            <div className="flex items-center gap-4 mt-3">
              <div className="text-xs text-muted-foreground">
                <span className="text-primary font-bold">{stats.currentStreak}</span> day streak
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="text-foreground font-semibold">{stats.totalCheckins}</span> total check-ins
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-card border border-card-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : todayCheckin || submitted ? (
          /* Completed state */
          <div className="space-y-6">
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-foreground">Checked in</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {todayCheckin
                    ? new Date(todayCheckin.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                    : "just now"}
                </span>
              </div>
              <div className="space-y-4">
                <ScoreBar label="Focus" value={todayCheckin?.focusScore ?? focus} color="hsl(var(--chart-1))" />
                <ScoreBar label="Confidence" value={todayCheckin?.confidenceScore ?? confidence} color="hsl(var(--chart-2))" />
                <ScoreBar label="Energy" value={todayCheckin?.energyScore ?? energy} color="hsl(var(--chart-3))" />
              </div>
              {todayCheckin?.note && (
                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">"{todayCheckin.note}"</p>
                </div>
              )}
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
              <p className="text-primary text-sm font-semibold">Check-in complete. Come back tomorrow.</p>
              <p className="text-muted-foreground text-xs mt-1">Consistency builds mental strength.</p>
            </div>
            <NotificationBanner />
          </div>
        ) : (
          /* Check-in form */
          <div className="space-y-4">
            <ScoreSlider
              label="Focus"
              sublabel="How sharp is your focus today?"
              value={focus}
              onChange={setFocus}
            />
            <ScoreSlider
              label="Confidence"
              sublabel="How confident do you feel going into training or competition?"
              value={confidence}
              onChange={setConfidence}
            />
            <ScoreSlider
              label="Energy"
              sublabel="How is your energy level right now?"
              value={energy}
              onChange={setEnergy}
            />

            {/* Note */}
            <div className="bg-card border border-card-border rounded-xl p-5">
              <label className="block text-sm font-semibold text-foreground mb-3">
                Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                data-testid="textarea-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind? Any context about today..."
                rows={3}
                className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Summary */}
            <div className="bg-secondary border border-border rounded-xl px-5 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Overall score</span>
              <span className="font-display text-2xl text-primary">
                {Math.round(((focus + confidence + energy) / 3) * 10) / 10}
              </span>
            </div>

            <button
              data-testid="button-submit-checkin"
              onClick={handleSubmit}
              disabled={createCheckin.isPending}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {createCheckin.isPending ? "Submitting..." : "Submit check-in"}
            </button>

            {createCheckin.isError && (
              <p className="text-destructive text-xs text-center">
                {(createCheckin.error as any)?.data?.error ?? "Something went wrong. Try again."}
              </p>
            )}
            <NotificationBanner />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
