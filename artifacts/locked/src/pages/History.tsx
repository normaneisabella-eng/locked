import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";

const GREEN = "#00e5a0";
const BLUE = "#60a5fa";
const AMBER = "#f59e0b";

type CheckinRow = {
  id: string;
  type: string;
  focus_score: number;
  confidence_score: number;
  energy_score: number;
  note: string | null;
  created_at: string;
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function History() {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<CheckinRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("checkins")
      .select("id, type, focus_score, confidence_score, energy_score, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setCheckins(data ?? []);
        setLoading(false);
      });
  }, [user]);

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

        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }} className="text-sm font-bold uppercase text-white mb-4">
          Last {checkins.length > 0 ? Math.min(checkins.length, 30) : ""} Check-Ins
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", height: "80px" }} className="animate-pulse" />
            ))}
          </div>
        ) : checkins.length === 0 ? (
          <div className="text-center py-24">
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "rgba(255,255,255,0.07)" }} className="text-7xl font-black uppercase mb-3">
              Zero
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)" }} className="text-sm">No check-ins yet. Start your streak today.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {checkins.map((c) => {
              const isPre = c.type !== "post";
              const overall = isPre
                ? Math.round(((c.focus_score + c.confidence_score + c.energy_score) / 3) * 10) / 10
                : Math.round(((c.focus_score + c.confidence_score) / 2) * 10) / 10;

              return (
                <div
                  key={c.id}
                  style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px" }}
                  className="px-5 py-4"
                >
                  {/* Date row + type badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium text-white">{formatDate(c.created_at)}</div>
                      {c.note && (
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }} className="italic mt-0.5 truncate max-w-[200px] md:max-w-xs">
                          "{c.note}"
                        </div>
                      )}
                    </div>
                    <span style={{
                      background: isPre ? `${GREEN}18` : `${BLUE}18`,
                      border: `1px solid ${isPre ? GREEN : BLUE}30`,
                      color: isPre ? GREEN : BLUE,
                      borderRadius: "6px", padding: "2px 8px",
                      fontSize: "10px", fontWeight: 700,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      flexShrink: 0, marginLeft: "12px",
                    }}>
                      {isPre ? "Pre" : "Post"}
                    </span>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center gap-4">
                    {isPre ? (
                      <>
                        {[
                          { k: "F", v: c.focus_score, color: GREEN },
                          { k: "C", v: c.confidence_score, color: BLUE },
                          { k: "E", v: c.energy_score, color: AMBER },
                        ].map((s) => (
                          <div key={s.k} className="text-center">
                            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", letterSpacing: "0.08em" }} className="uppercase">{s.k}</div>
                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: s.color, fontSize: "20px", fontWeight: 700, lineHeight: 1 }}>{s.v}</div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {[
                          { k: "Perf", v: c.focus_score, color: BLUE },
                          { k: "Lock", v: c.confidence_score, color: GREEN },
                        ].map((s) => (
                          <div key={s.k} className="text-center">
                            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", letterSpacing: "0.08em" }} className="uppercase">{s.k}</div>
                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: s.color, fontSize: "20px", fontWeight: 700, lineHeight: 1 }}>{s.v}</div>
                          </div>
                        ))}
                      </>
                    )}
                    <div style={{ borderLeft: "1px solid #2a2a2a", marginLeft: "auto" }} className="pl-4 text-center">
                      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", letterSpacing: "0.08em" }} className="uppercase">Avg</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "rgba(255,255,255,0.7)", fontSize: "20px", fontWeight: 700, lineHeight: 1 }}>{overall}</div>
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
