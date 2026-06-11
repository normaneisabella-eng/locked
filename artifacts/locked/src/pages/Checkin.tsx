import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";

const GREEN = "#00e5a0";
const BLUE = "#60a5fa";
const AMBER = "#f59e0b";

// ── Shared components ─────────────────────────────────────────────────────

function ScorePicker({ label, sublabel, value, onChange }: {
  label: string; sublabel: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }} className="p-5">
      <div className="flex items-baseline justify-between mb-1">
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }} className="text-base font-bold uppercase text-white">
          {label}
        </span>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: GREEN }} className="text-3xl font-black">{value}</span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs mb-4">{sublabel}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button key={n} onClick={() => onChange(n)} style={{
            flex: 1, height: "36px", borderRadius: "6px",
            background: n === value ? GREEN : "#1a1a1a",
            border: `1px solid ${n === value ? GREEN : "#2a2a2a"}`,
            color: n === value ? "#0a0a0a" : "rgba(255,255,255,0.3)",
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, transition: "all 0.12s",
          }}>{n}</button>
        ))}
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color = GREEN }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }} className="text-xs font-semibold uppercase">{label}</span>
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

function ShareToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} style={{
      background: "#111", border: `1px solid ${value ? GREEN + "50" : "#2a2a2a"}`, borderRadius: "12px",
      width: "100%", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
      cursor: "pointer", transition: "border-color 0.15s",
    }}>
      <div style={{ textAlign: "left" }}>
        <div style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Barlow', sans-serif", fontSize: "13px", fontWeight: 600 }}>
          Share anonymously with community
        </div>
        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", marginTop: "2px" }}>
          {value ? "Visible in the community feed" : "Private — only you can see this"}
        </div>
      </div>
      <div style={{ width: "44px", height: "24px", borderRadius: "999px", background: value ? GREEN : "#2a2a2a", position: "relative", flexShrink: 0, transition: "background 0.2s", marginLeft: "16px" }}>
        <div style={{ position: "absolute", top: "3px", left: value ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: value ? "#0a0a0a" : "rgba(255,255,255,0.3)", transition: "left 0.2s" }} />
      </div>
    </button>
  );
}

// ── Pre-Game section ──────────────────────────────────────────────────────

function PreGameForm({ sport, onSave }: { sport: string; onSave: (data: any) => void }) {
  const [focus, setFocus] = useState(7);
  const [confidence, setConfidence] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [note, setNote] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (loading || !user) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from("checkins").insert({
      user_id: user.id, sport, type: "pre",
      focus_score: focus, confidence_score: confidence, energy_score: energy,
      note: note.trim() || null, is_public: isPublic,
    }).select().single();
    setLoading(false);
    if (err) { setError("Something went wrong. Try again."); }
    else { onSave(data); }
  };

  return (
    <div className="space-y-3">
      <ScorePicker label="Focus" sublabel="How sharp is your focus today?" value={focus} onChange={setFocus} />
      <ScorePicker label="Confidence" sublabel="How confident do you feel going into training or competition?" value={confidence} onChange={setConfidence} />
      <ScorePicker label="Energy" sublabel="How is your energy level right now?" value={energy} onChange={setEnergy} />

      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }} className="p-5">
        <label style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em" }} className="block text-xs font-semibold uppercase mb-3">
          Notes <span style={{ color: "rgba(255,255,255,0.2)" }} className="normal-case font-normal tracking-normal">(optional)</span>
        </label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="What's on your mind? Any context about today..."
          rows={3} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "white", fontFamily: "'Barlow', sans-serif", fontSize: "13px", resize: "none", width: "100%", padding: "10px 12px" }}
          className="placeholder:text-white/20 focus:outline-none focus:border-[#00e5a0]/40 transition-colors"
        />
      </div>

      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px" }} className="px-5 py-3 flex items-center justify-between">
        <span style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }} className="text-xs font-semibold uppercase">Overall</span>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: GREEN }} className="text-3xl font-black">
          {Math.round(((focus + confidence + energy) / 3) * 10) / 10}
        </span>
      </div>

      <ShareToggle value={isPublic} onChange={setIsPublic} />

      <button onClick={handleSubmit} disabled={loading}
        style={{ background: GREEN, color: "#0a0a0a", borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", width: "100%", padding: "16px" }}
        className="font-black text-base uppercase tracking-wide hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Submit Pre-Game Check-In →"}
      </button>
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
    </div>
  );
}

function PreGameDone({ checkin, justSaved }: { checkin: any; justSaved: boolean }) {
  return (
    <div className="space-y-3">
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px" }} className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: GREEN }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }} className="text-sm font-bold uppercase text-white">
            {justSaved ? "Locked in" : "Already checked in today"}
          </span>
        </div>
        <div className="space-y-5">
          <ScoreBar label="Focus" value={checkin.focus_score} color={GREEN} />
          <ScoreBar label="Confidence" value={checkin.confidence_score} color={BLUE} />
          <ScoreBar label="Energy" value={checkin.energy_score} color={AMBER} />
        </div>
        {checkin.note && (
          <div style={{ borderTop: "1px solid #1e1e1e" }} className="mt-5 pt-5">
            <p style={{ color: "rgba(255,255,255,0.4)" }} className="text-sm italic">"{checkin.note}"</p>
          </div>
        )}
      </div>
      {justSaved && (
        <div style={{ background: `${GREEN}14`, border: `1px solid ${GREEN}30`, borderRadius: "12px" }} className="p-4 text-center">
          <p style={{ color: GREEN }} className="text-sm font-semibold">Pre-game check-in saved ✓</p>
          <p style={{ color: "rgba(255,255,255,0.3)" }} className="text-xs mt-1">Consistency builds mental strength.</p>
        </div>
      )}
    </div>
  );
}

// ── Post-Game section ─────────────────────────────────────────────────────

function PostGameForm({ sport, onSave }: { sport: string; onSave: (data: any) => void }) {
  const [performance, setPerformance] = useState(7);
  const [lockIn, setLockIn] = useState(7);
  const [improvement, setImprovement] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (loading || !user) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.from("checkins").insert({
      user_id: user.id, sport, type: "post",
      focus_score: performance, confidence_score: lockIn, energy_score: 0,
      note: improvement.trim() || null, is_public: isPublic,
    }).select().single();
    setLoading(false);
    if (err) { setError("Something went wrong. Try again."); }
    else { onSave(data); }
  };

  return (
    <div className="space-y-3">
      <ScorePicker label="Performance" sublabel="How did you perform today?" value={performance} onChange={setPerformance} />
      <ScorePicker label="Mental Lock-In" sublabel="Did you feel mentally locked in during the game or practice?" value={lockIn} onChange={setLockIn} />

      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }} className="p-5">
        <label style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em" }} className="block text-xs font-semibold uppercase mb-3">
          One thing to improve
        </label>
        <textarea value={improvement} onChange={(e) => setImprovement(e.target.value)}
          placeholder="What's one thing you want to work on next time?"
          rows={3} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "white", fontFamily: "'Barlow', sans-serif", fontSize: "13px", resize: "none", width: "100%", padding: "10px 12px" }}
          className="placeholder:text-white/20 focus:outline-none focus:border-[#00e5a0]/40 transition-colors"
        />
      </div>

      <ShareToggle value={isPublic} onChange={setIsPublic} />

      <button onClick={handleSubmit} disabled={loading}
        style={{ background: "#1a1a1a", color: GREEN, border: `1px solid ${GREEN}50`, borderRadius: "12px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", width: "100%", padding: "16px" }}
        className="font-black text-base uppercase tracking-wide hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Submit Post-Game Check-In →"}
      </button>
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
    </div>
  );
}

function PostGameDone({ checkin, justSaved }: { checkin: any; justSaved: boolean }) {
  return (
    <div className="space-y-3">
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px" }} className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: BLUE }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }} className="text-sm font-bold uppercase text-white">
            {justSaved ? "Post-game logged" : "Post-game already logged today"}
          </span>
        </div>
        <div className="space-y-5">
          <ScoreBar label="Performance" value={checkin.focus_score} color={BLUE} />
          <ScoreBar label="Mental Lock-In" value={checkin.confidence_score} color={GREEN} />
        </div>
        {checkin.note && (
          <div style={{ borderTop: "1px solid #1e1e1e" }} className="mt-5 pt-5">
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>Improve next time</p>
            <p style={{ color: "rgba(255,255,255,0.6)" }} className="text-sm">"{checkin.note}"</p>
          </div>
        )}
      </div>
      {justSaved && (
        <div style={{ background: `${BLUE}14`, border: `1px solid ${BLUE}30`, borderRadius: "12px" }} className="p-4 text-center">
          <p style={{ color: BLUE }} className="text-sm font-semibold">Post-game check-in saved ✓</p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function Checkin() {
  const { user } = useAuth();
  const [todayPre, setTodayPre] = useState<any>(null);
  const [todayPost, setTodayPost] = useState<any>(null);
  const [preSaved, setPreSaved] = useState(false);
  const [postSaved, setPostSaved] = useState(false);
  const [totalCheckins, setTotalCheckins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sport, setSport] = useState("");

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    supabase.from("profiles").select("sport").eq("id", user.id).single()
      .then(({ data }) => { if (data) setSport(data.sport); });

    // Load today's pre and post separately
    supabase.from("checkins").select("*")
      .eq("user_id", user.id).eq("type", "pre")
      .gte("created_at", `${today}T00:00:00`).lt("created_at", `${today}T23:59:59`)
      .maybeSingle().then(({ data }) => { if (data) setTodayPre(data); });

    supabase.from("checkins").select("*")
      .eq("user_id", user.id).eq("type", "post")
      .gte("created_at", `${today}T00:00:00`).lt("created_at", `${today}T23:59:59`)
      .maybeSingle().then(({ data }) => { if (data) setTodayPost(data); });

    // Total pre-game count + streak (pre-game only)
    supabase.from("checkins").select("created_at")
      .eq("user_id", user.id).eq("type", "pre")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setTotalCheckins(data.length);

        const days = new Set(data.map((r) => r.created_at.slice(0, 10)));
        const todayKey = new Date().toISOString().slice(0, 10);
        const cursor = new Date();
        cursor.setUTCHours(0, 0, 0, 0);
        // Show pending streak if today not yet checked in
        if (!days.has(todayKey)) cursor.setUTCDate(cursor.getUTCDate() - 1);
        let count = 0;
        while (true) {
          const key = cursor.toISOString().slice(0, 10);
          if (!days.has(key)) break;
          count++;
          cursor.setUTCDate(cursor.getUTCDate() - 1);
        }
        setStreak(count);
      });
  }, [user]);

  const handlePreSave = (data: any) => {
    setTodayPre(data);
    setPreSaved(true);
    setTotalCheckins((t) => t + 1);
    setStreak((s) => s + 1);
  };

  const handlePostSave = (data: any) => {
    setTodayPost(data);
    setPostSaved(true);
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-6 py-8">

        {/* ── Streak Hero ── */}
        <div className="mb-8 text-center">
          <div style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.18em" }} className="text-xs font-semibold uppercase mb-5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(80px, 20vw, 120px)", lineHeight: 1, color: GREEN, fontWeight: 900, letterSpacing: "-0.02em" }}>
            {streak}
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", marginTop: "6px", letterSpacing: "0.02em" }}>
            🔥 day streak
          </div>
          <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
            <div style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs">
              <span className="text-white font-semibold">{totalCheckins}</span> pre-game check-ins
            </div>
            {sport && (
              <span style={{ background: `${GREEN}18`, border: `1px solid ${GREEN}30`, color: GREEN, borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>
                {sport}
              </span>
            )}
          </div>
        </div>

        {/* ── Pre-Game Check-In ── */}
        <div style={{ borderTop: "1px solid #1a1a1a" }} className="pt-7 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }} className="text-3xl font-black uppercase text-white">
                Pre-Game <span style={{ color: GREEN }}>Check-In</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginTop: "4px" }}>
                Counts toward your streak · 1 per day
              </p>
            </div>
          </div>

          {todayPre ? (
            <PreGameDone checkin={todayPre} justSaved={preSaved} />
          ) : (
            <PreGameForm sport={sport} onSave={handlePreSave} />
          )}
        </div>

        {/* ── Post-Game Check-In ── */}
        <div style={{ borderTop: "1px solid #1a1a1a" }} className="pt-7 mt-4 mb-8">
          <div className="mb-5">
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }} className="text-3xl font-black uppercase text-white">
              Post-Game <span style={{ color: BLUE }}>Check-In</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginTop: "4px" }}>
              Optional · Doesn't affect streak
            </p>
          </div>

          {todayPost ? (
            <PostGameDone checkin={todayPost} justSaved={postSaved} />
          ) : (
            <PostGameForm sport={sport} onSave={handlePostSave} />
          )}
        </div>

      </div>
    </AppLayout>
  );
}
