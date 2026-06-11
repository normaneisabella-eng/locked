import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";

const SPORTS = [
  "Lacrosse", "Basketball", "Soccer", "Football", "Baseball",
  "Softball", "Swimming", "Track & Field", "Volleyball", "Wrestling",
  "Tennis", "Field Hockey", "Rowing", "Cross Country",
];

const LEVELS = [
  "Middle School",
  "High School JV",
  "High School Varsity",
  "Club / Travel",
  "College",
];

const GREEN = "#00e5a0";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [sport, setSport] = useState("");
  const [handle, setHandle] = useState("");
  const [level, setLevel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { setProfile } = useProfile();

  const canSubmit = !!sport && !!handle.trim() && !!level && !loading;

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setLoading(true);
    setError(null);

    const trimmedHandle = handle.trim();

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, handle: trimmedHandle, sport, level });

    if (profileError) {
      setError("Failed to save profile. Try again.");
      setLoading(false);
      return;
    }

    // Push the new profile into context immediately — OnboardingGate
    // reads from context so it won't bounce back to /onboarding
    setProfile({ id: user.id, handle: trimmedHandle, sport, level });
    setLocation("/checkin");
  };

  return (
    <div
      style={{ background: "#0a0a0a", fontFamily: "'Barlow', sans-serif" }}
      className="min-h-screen text-white flex flex-col items-center justify-center px-6 py-12"
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="w-full max-w-md">
        <div className="mb-10">
          <div
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
            className="text-2xl font-bold mb-6"
          >
            <span className="text-white">Locke</span>
            <span style={{ color: GREEN }}>d</span>
          </div>
          <h1
            style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}
            className="text-5xl font-black uppercase text-white mb-3"
          >
            Set up your<br />
            <span style={{ color: GREEN }}>profile</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)" }} className="text-sm font-light">
            Tell us who you are so we can match your community.
          </p>
        </div>

        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px" }} className="p-8 space-y-7">
          {/* Handle */}
          <div>
            <label style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em" }} className="block text-xs font-semibold uppercase mb-2">
              Your handle
            </label>
            <input
              data-testid="input-display-name"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. Jordan23, CoachMike..."
              style={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "10px",
                color: "white",
                fontFamily: "'Barlow', sans-serif",
                width: "100%",
                padding: "12px 14px",
              }}
              className="text-sm placeholder:text-white/20 focus:outline-none focus:border-[#00e5a0]/40 transition-colors"
            />
          </div>

          {/* Sport */}
          <div>
            <label style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em" }} className="block text-xs font-semibold uppercase mb-3">
              Your sport
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SPORTS.map((s) => (
                <button
                  key={s}
                  data-testid={`button-sport-${s}`}
                  onClick={() => setSport(s)}
                  style={{
                    background: sport === s ? GREEN : "#1a1a1a",
                    border: `1px solid ${sport === s ? GREEN : "#2a2a2a"}`,
                    color: sport === s ? "#0a0a0a" : "rgba(255,255,255,0.5)",
                    borderRadius: "8px",
                    fontFamily: "'Barlow', sans-serif",
                    padding: "8px 6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <label style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em" }} className="block text-xs font-semibold uppercase mb-3">
              Your level
            </label>
            <div className="flex flex-col gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  data-testid={`button-level-${l}`}
                  onClick={() => setLevel(l)}
                  style={{
                    background: level === l ? GREEN : "#1a1a1a",
                    border: `1px solid ${level === l ? GREEN : "#2a2a2a"}`,
                    color: level === l ? "#0a0a0a" : "rgba(255,255,255,0.5)",
                    borderRadius: "8px",
                    fontFamily: "'Barlow', sans-serif",
                    padding: "10px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button
            data-testid="button-complete-onboarding"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              background: canSubmit ? GREEN : "#1a1a1a",
              color: canSubmit ? "#0a0a0a" : "rgba(255,255,255,0.3)",
              borderRadius: "10px",
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.05em",
              width: "100%",
              padding: "16px",
            }}
            className="font-black text-base uppercase tracking-wide transition-all disabled:cursor-not-allowed"
          >
            {loading ? "Setting up..." : "Get Locked In →"}
          </button>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
