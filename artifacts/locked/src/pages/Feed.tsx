import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";

const GREEN = "#00e5a0";

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

type CheckinRow = {
  id: string;
  sport: string;
  focus_score: number;
  confidence_score: number;
  energy_score: number;
  note: string | null;
  created_at: string;
};

export default function Feed() {
  const { user } = useAuth();
  const [items, setItems] = useState<CheckinRow[]>([]);
  const [userSport, setUserSport] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("sport")
      .eq("id", user.id)
      .single()
      .then(async ({ data: profile }) => {
        if (!profile) { setLoading(false); return; }
        setUserSport(profile.sport);

        const { data } = await supabase
          .from("checkins")
          .select("id, sport, focus_score, confidence_score, energy_score, note, created_at")
          .eq("sport", profile.sport)
          .order("created_at", { ascending: false })
          .limit(50);

        setItems(data ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-7">
          <div style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.18em" }} className="text-xs font-semibold uppercase mb-2">
            Anonymous
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }} className="text-5xl font-black uppercase text-white">
            Community <span style={{ color: GREEN }}>Feed</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-sm mt-2 font-light">
            Real minds. No names.{userSport ? ` ${userSport} athletes being honest.` : " Just athletes being honest."}
          </p>
        </div>

        {/* Sport badge */}
        {userSport && (
          <div className="mb-6">
            <span style={{ background: `${GREEN}18`, border: `1px solid ${GREEN}35`, color: GREEN, borderRadius: "8px", padding: "4px 12px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em" }}>
              {userSport}
            </span>
          </div>
        )}

        {/* Feed items */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", height: "100px" }} className="animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "rgba(255,255,255,0.07)" }} className="text-7xl font-black uppercase mb-4">
              Quiet
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)" }} className="text-sm">
              No check-ins yet from your {userSport} community.
              <br />Be the first today.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const overall = Math.round(((item.focus_score + item.confidence_score + item.energy_score) / 3) * 10) / 10;
              return (
                <div
                  key={item.id}
                  style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }}
                  className="p-5 hover:border-[#00e5a0]/20 transition-colors"
                >
                  {/* Sport tag + time */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span style={{
                        background: "#1a1a1a", border: "1px solid #2a2a2a", color: GREEN,
                        borderRadius: "6px", padding: "2px 8px",
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px",
                        fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                      }}>
                        {item.sport}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>
                        {timeAgo(item.created_at)}
                      </span>
                    </div>

                    {/* Scores */}
                    <div className="flex items-center gap-4">
                      {[
                        { label: "F", value: item.focus_score, color: GREEN },
                        { label: "C", value: item.confidence_score, color: "#60a5fa" },
                        { label: "E", value: item.energy_score, color: "#f59e0b" },
                      ].map((s) => (
                        <div key={s.label} className="flex flex-col items-center">
                          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "9px", letterSpacing: "0.08em" }}>{s.label}</span>
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: s.color, fontSize: "18px", fontWeight: 700, lineHeight: 1 }}>
                            {s.value}
                          </span>
                        </div>
                      ))}
                      <div style={{ borderLeft: "1px solid #2a2a2a" }} className="pl-3 flex flex-col items-center">
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "9px", letterSpacing: "0.08em" }}>AVG</span>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "rgba(255,255,255,0.7)", fontSize: "18px", fontWeight: 800, lineHeight: 1 }}>
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
