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

const GREEN = "#00e5a0";

function ScorePicker({
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
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }} className="p-5">
      <div className="flex items-baseline justify-between mb-1">
        <span
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
          className="text-base font-bold uppercase text-white"
        >
          {label}
        </span>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: GREEN }} className="text-3xl font-black">
          {value}
        </span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs mb-4">{sublabel}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            data-testid={`picker-${label.toLowerCase()}-${n}`}
            onClick={() => onChange(n)}
            style={{
              flex: 1,
              height: "36px",
              borderRadius: "6px",
              background: n === value ? GREEN : "#1a1a1a",
              border: `1px solid ${n === value ? GREEN : "#2a2a2a"}`,
              color: n === value ? "#0a0a0a" : "rgba(255,255,255,0.3)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              transition: "all 0.12s",
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <input
        data-testid={`slider-${label.toLowerCase()}`}
        type="range" min={1} max={10} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="sr-only"
      />
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }} className="text-xs font-semibold uppercase">
          {label}
        </span>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: GREEN }} className="text-lg font-bold">
          {value}<span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>/10</span>
        </span>
      </div>
      <div style={{ background: "#1a1a1a", borderRadius: "4px", height: "4px", overflow: "hidden" }}>
        <div
          style={{
            width: `${(value / 10) * 100}%`,
            height: "100%",
            background: GREEN,
            borderRadius: "4px",
            transition: "width 0.4s ease",
          }}
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
      { data: { focusScore: focus, confidenceScore: confidence, energyScore: energy, note: note.trim() || undefined } },
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
      <div className="max-w-xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.18em" }} className="text-xs font-semibold uppercase mb-2">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <h1
            style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}
            className="text-5xl font-black uppercase text-white"
          >
            {todayCheckin ? "Today's" : "Daily"}{" "}
            <span style={{ color: GREEN }}>Check-In</span>
          </h1>
          {stats && (
            <div className="flex items-center gap-5 mt-3">
              <div style={{ color: "rgba(255,255,255,0.4)" }} className="text-xs">
                <span style={{ color: GREEN }} className="font-bold text-base">{stats.currentStreak}</span>{" "}
                day streak
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)" }} className="text-xs">
                <span className="text-white font-semibold">{stats.totalCheckins}</span> total check-ins
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", height: "110px" }} className="animate-pulse" />
            ))}
          </div>
        ) : todayCheckin || submitted ? (
          /* ── Completed state ── */
          <div className="space-y-4">
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px" }} className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: GREEN }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }} className="text-sm font-bold uppercase text-white">
                  Checked in
                </span>
                <span style={{ color: "rgba(255,255,255,0.25)" }} className="text-xs ml-auto">
                  {todayCheckin
                    ? new Date(todayCheckin.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                    : "just now"}
                </span>
              </div>
              <div className="space-y-5">
                <ScoreBar label="Focus" value={todayCheckin?.focusScore ?? focus} />
                <ScoreBar label="Confidence" value={todayCheckin?.confidenceScore ?? confidence} />
                <ScoreBar label="Energy" value={todayCheckin?.energyScore ?? energy} />
              </div>
              {todayCheckin?.note && (
                <div style={{ borderTop: "1px solid #1e1e1e" }} className="mt-5 pt-5">
                  <p style={{ color: "rgba(255,255,255,0.4)" }} className="text-sm italic">"{todayCheckin.note}"</p>
                </div>
              )}
            </div>

            <div style={{ background: `${GREEN}14`, border: `1px solid ${GREEN}30`, borderRadius: "12px" }} className="p-4 text-center">
              <p style={{ color: GREEN }} className="text-sm font-semibold">Check-in complete. Come back tomorrow.</p>
              <p style={{ color: "rgba(255,255,255,0.3)" }} className="text-xs mt-1">Consistency builds mental strength.</p>
            </div>

            <NotificationBanner />
          </div>
        ) : (
          /* ── Check-in form ── */
          <div className="space-y-3">
            <ScorePicker
              label="Focus"
              sublabel="How sharp is your focus today?"
              value={focus}
              onChange={setFocus}
            />
            <ScorePicker
              label="Confidence"
              sublabel="How confident do you feel going into training or competition?"
              value={confidence}
              onChange={setConfidence}
            />
            <ScorePicker
              label="Energy"
              sublabel="How is your energy level right now?"
              value={energy}
              onChange={setEnergy}
            />

            {/* Notes */}
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }} className="p-5">
              <label style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em" }} className="block text-xs font-semibold uppercase mb-3">
                Notes <span style={{ color: "rgba(255,255,255,0.2)" }} className="normal-case font-normal tracking-normal">(optional)</span>
              </label>
              <textarea
                data-testid="textarea-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind? Any context about today..."
                rows={3}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  color: "white",
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "13px",
                  resize: "none",
                  width: "100%",
                  padding: "10px 12px",
                }}
                className="placeholder:text-white/20 focus:outline-none focus:border-[#00e5a0]/40 transition-colors"
              />
            </div>

            {/* Overall score */}
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px" }} className="px-5 py-3 flex items-center justify-between">
              <span style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }} className="text-xs font-semibold uppercase">Overall</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: GREEN }} className="text-3xl font-black">
                {Math.round(((focus + confidence + energy) / 3) * 10) / 10}
              </span>
            </div>

            {/* Submit */}
            <button
              data-testid="button-submit-checkin"
              onClick={handleSubmit}
              disabled={createCheckin.isPending}
              style={{
                background: GREEN,
                color: "#0a0a0a",
                borderRadius: "12px",
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.08em",
                width: "100%",
                padding: "16px",
              }}
              className="font-black text-base uppercase tracking-wide hover:opacity-90 transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {createCheckin.isPending ? "Submitting..." : "Submit Check-In →"}
            </button>

            {createCheckin.isError && (
              <p className="text-red-400 text-xs text-center">
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
