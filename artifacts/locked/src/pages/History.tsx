import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";

const GREEN = "#00e5a0";

type CheckinRow = {
  id: string;
  focus_score: number;
  confidence_score: number;
  energy_score: number;
  note: string | null;
  created_at: string;
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function History() {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<CheckinRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("checkins")
      .select("id, focus_score, confidence_score, energy_score, note, created_at")
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

        {/* List */}
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }} className="text-sm font-bold uppercase text-white mb-4">
          Last {checkins.length > 0 ? Math.min(checkins.length, 30) : ""} Check-Ins
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", height: "72px" }} className="animate-pulse" />
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
              const overall = Math.round(((c.focus_score + c.confidence_score + c.energy_score) / 3) * 10) / 10;
              return (
                <div
                  key={c.id}
                  style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px" }}
                  className="px-5 py-4 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white">{formatDate(c.created_at)}</div>
                    {c.note && (
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }} className="italic mt-0.5 truncate max-w-[180px] md:max-w-xs">
                        "{c.note}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {[
                      { k: "F", v: c.focus_score, color: GREEN },
                      { k: "C", v: c.confidence_score, color: "#60a5fa" },
                      { k: "E", v: c.energy_score, color: "#f59e0b" },
                    ].map((s) => (
                      <div key={s.k} className="text-center">
                        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", letterSpacing: "0.08em" }} className="uppercase">{s.k}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: s.color, fontSize: "20px", fontWeight: 700, lineHeight: 1 }}>
                          {s.v}
                        </div>
                      </div>
                    ))}
                    <div style={{ borderLeft: "1px solid #2a2a2a" }} className="pl-4 text-center">
                      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", letterSpacing: "0.08em" }} className="uppercase">Avg</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "rgba(255,255,255,0.7)", fontSize: "20px", fontWeight: 700, lineHeight: 1 }}>
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
