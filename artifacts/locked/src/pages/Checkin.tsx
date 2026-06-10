import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";

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
    </div>
  );
}

function ScoreBar({ label, value, color = GREEN }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }} className="text-xs font-semibold uppercase">
          {label}
        </span>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color }} className="text-lg font-bold">
          {value}<span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>/10</span>
        </span>
      </div>
      <div style={{ background: "#1a1a1a", borderRadius: "4px", height: "4px", overflow: "hidden" }}>
        <div style={{ width: `${(value / 10) * 100}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

export default function Checkin() {
  const [focus, setFocus] = useState(7);
  const [confidence, setConfidence] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [totalCheckins, setTotalCheckins] = useState(0);
  const [sport, setSport] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    // Load profile (for sport tag)
    supabase.from("profiles").select("sport").eq("id", user.id).single()
      .then(({ data }) => { if (data) setSport(data.sport); });

    // Check if already checked in today
    supabase.from("checkins").select("*")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00`)
      .lt("created_at", `${today}T23:59:59`)
      .maybeSingle()
      .then(({ data }) => { if (data) setTodayCheckin(data); });

    // Total count
    supabase.from("checkins").select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => { if (count != null) setTotalCheckins(count); });
  }, [user]);

  const handleSubmit = async () => {
    if (loading || !user) return;
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("checkins")
      .insert({
        user_id: user.id,
        sport,
        focus_score: focus,
        confidence_score: confidence,
        energy_score: energy,
        note: note.trim() || null,
      })
      .select()
      .single();

    setLoading(false);
    if (err) {
      setError("Something went wrong. Try again.");
    } else {
      setTodayCheckin(data);
      setJustSubmitted(true);
      setTotalCheckins((t) => t + 1);
    }
  };

  const checkin = todayCheckin;
  const displayScores = checkin
    ? { focus: checkin.focus_score, confidence: checkin.confidence_score, energy: checkin.energy_score, note: checkin.note }
    : justSubmitted
    ? { focus, confidence, energy, note: note.trim() || null }
    : null;

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.18em" }} className="text-xs font-semibold uppercase mb-2">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }} className="text-5xl font-black uppercase text-white">
            Daily <span style={{ color: GREEN }}>Check-In</span>
          </h1>
          <div className="flex items-center gap-4 mt-3">
            <div style={{ color: "rgba(255,255,255,0.4)" }} className="text-xs">
              <span className="text-white font-semibold">{totalCheckins}</span> total check-ins
            </div>
            {sport && (
              <span style={{ background: `${GREEN}18`, border: `1px solid ${GREEN}30`, color: GREEN, borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>
                {sport}
              </span>
            )}
          </div>
        </div>

        {displayScores ? (
          /* ── Completion / already checked in ── */
          <div className="space-y-4">
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px" }} className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: GREEN }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }} className="text-sm font-bold uppercase text-white">
                  {justSubmitted ? "Locked in" : "Already checked in today"}
                </span>
              </div>
              <div className="space-y-5">
                <ScoreBar label="Focus" value={displayScores.focus} color={GREEN} />
                <ScoreBar label="Confidence" value={displayScores.confidence} color="#60a5fa" />
                <ScoreBar label="Energy" value={displayScores.energy} color="#f59e0b" />
              </div>
              {displayScores.note && (
                <div style={{ borderTop: "1px solid #1e1e1e" }} className="mt-5 pt-5">
                  <p style={{ color: "rgba(255,255,255,0.4)" }} className="text-sm italic">"{displayScores.note}"</p>
                </div>
              )}
            </div>

            <div style={{ background: `${GREEN}14`, border: `1px solid ${GREEN}30`, borderRadius: "12px" }} className="p-5 text-center">
              {justSubmitted ? (
                <>
                  <p style={{ color: GREEN }} className="text-base font-semibold">Check-in saved ✓</p>
                  <p style={{ color: "rgba(255,255,255,0.3)" }} className="text-xs mt-1">Come back tomorrow. Consistency builds mental strength.</p>
                </>
              ) : (
                <>
                  <p style={{ color: "rgba(255,255,255,0.5)" }} className="text-sm">You're already locked in for today.</p>
                  <p style={{ color: "rgba(255,255,255,0.3)" }} className="text-xs mt-1">See you tomorrow.</p>
                </>
              )}
            </div>
          </div>
        ) : (
          /* ── Check-in form ── */
          <div className="space-y-3">
            <ScorePicker label="Focus" sublabel="How sharp is your focus today?" value={focus} onChange={setFocus} />
            <ScorePicker label="Confidence" sublabel="How confident do you feel going into training or competition?" value={confidence} onChange={setConfidence} />
            <ScorePicker label="Energy" sublabel="How is your energy level right now?" value={energy} onChange={setEnergy} />

            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }} className="p-5">
              <label style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em" }} className="block text-xs font-semibold uppercase mb-3">
                Notes <span style={{ color: "rgba(255,255,255,0.2)" }} className="normal-case font-normal tracking-normal">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind? Any context about today..."
                rows={3}
                style={{
                  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px",
                  color: "white", fontFamily: "'Barlow', sans-serif", fontSize: "13px",
                  resize: "none", width: "100%", padding: "10px 12px",
                }}
                className="placeholder:text-white/20 focus:outline-none focus:border-[#00e5a0]/40 transition-colors"
              />
            </div>

            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px" }} className="px-5 py-3 flex items-center justify-between">
              <span style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }} className="text-xs font-semibold uppercase">Overall</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: GREEN }} className="text-3xl font-black">
                {Math.round(((focus + confidence + energy) / 3) * 10) / 10}
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ background: GREEN, color: "#0a0a0a", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", width: "100%", padding: "16px" }}
              className="font-black text-base uppercase tracking-wide hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Check-In →"}
            </button>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
