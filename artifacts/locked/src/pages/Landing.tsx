import { useLocation } from "wouter";

const GREEN = "#00e5a0";

const SAMPLE_FEED = [
  {
    id: 1,
    sport: "Lacrosse",
    time: "14m ago",
    focus: 8,
    confidence: 6,
    energy: 7,
    note: "Big playoff game tomorrow. Trying to stay in the moment and not overthink it.",
  },
  {
    id: 2,
    sport: "Lacrosse",
    time: "1h ago",
    focus: 5,
    confidence: 4,
    energy: 6,
    note: "Missed a few passes at practice. Hard to shake it off.",
  },
  {
    id: 3,
    sport: "Lacrosse",
    time: "3h ago",
    focus: 9,
    confidence: 9,
    energy: 8,
    note: null,
  },
];

function PreviewScorePicker({
  label,
  sublabel,
  selected,
}: {
  label: string;
  sublabel: string;
  selected: number;
}) {
  return (
    <div
      style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }}
      className="p-5"
    >
      <div className="flex items-baseline justify-between mb-1">
        <span
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
          className="text-base font-bold uppercase text-white"
        >
          {label}
        </span>
        <span
          style={{ fontFamily: "'Barlow Condensed', sans-serif", color: GREEN }}
          className="text-3xl font-black"
        >
          {selected}
        </span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs mb-4">
        {sublabel}
      </p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <div
            key={n}
            style={{
              flex: 1,
              height: "36px",
              borderRadius: "6px",
              background: n === selected ? GREEN : "#1a1a1a",
              border: `1px solid ${n === selected ? GREEN : "#2a2a2a"}`,
              color: n === selected ? "#0a0a0a" : "rgba(255,255,255,0.3)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewFeedCard({
  sport,
  time,
  focus,
  confidence,
  energy,
  note,
}: {
  sport: string;
  time: string;
  focus: number;
  confidence: number;
  energy: number;
  note: string | null;
}) {
  const overall = Math.round(((focus + confidence + energy) / 3) * 10) / 10;
  return (
    <div
      style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }}
      className="p-5"
    >
      {/* Row 1: sport tag + time + scores */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            style={{
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              color: GREEN,
              borderRadius: "6px",
              padding: "2px 8px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {sport}
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>{time}</span>
        </div>

        <div className="flex items-center gap-4">
          {[
            { label: "F", value: focus, color: GREEN },
            { label: "C", value: confidence, color: "#60a5fa" },
            { label: "E", value: energy, color: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span
                style={{ color: "rgba(255,255,255,0.2)", fontSize: "9px", letterSpacing: "0.08em" }}
              >
                {s.label}
              </span>
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  color: s.color,
                  fontSize: "18px",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </span>
            </div>
          ))}
          <div style={{ borderLeft: "1px solid #2a2a2a" }} className="pl-3 flex flex-col items-center">
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "9px", letterSpacing: "0.08em" }}>
              AVG
            </span>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                color: "rgba(255,255,255,0.7)",
                fontSize: "18px",
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {overall}
            </span>
          </div>
        </div>
      </div>

      {/* Note */}
      {note && (
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", fontStyle: "italic" }}>
          "{note}"
        </p>
      )}
    </div>
  );
}

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div
      style={{ background: "#0a0a0a", fontFamily: "'Barlow', sans-serif" }}
      className="min-h-screen text-white"
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Barlow:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ── Navbar ── */}
      <nav
        style={{ borderBottom: "1px solid #141414" }}
        className="flex items-center justify-between px-8 md:px-16 py-5"
      >
        <div
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
          className="text-2xl font-bold"
        >
          <span className="text-white">Locke</span>
          <span style={{ color: GREEN }}>d</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setLocation("/sign-in")}
            className="text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => setLocation("/sign-up")}
            style={{ background: GREEN, color: "#0a0a0a" }}
            className="text-sm font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-8 md:px-16 pt-24 pb-20 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <div style={{ background: GREEN, width: "32px", height: "2px" }} />
          <span
            style={{ color: GREEN, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.2em" }}
            className="text-xs font-semibold uppercase"
          >
            Mental Performance
          </span>
        </div>

        <h1
          style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 0.9 }}
          className="text-[clamp(72px,12vw,160px)] font-black uppercase leading-none mb-8"
        >
          <span className="block text-white">Train</span>
          <span className="block" style={{ color: GREEN }}>Your</span>
          <span className="block" style={{ WebkitTextStroke: "2px #fff", color: "transparent" }}>
            Mind
          </span>
        </h1>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mt-10">
          <p className="text-xl md:text-2xl font-light max-w-md" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
            You train your body every day.
            <br />
            <span className="text-white font-medium">Your mind is the other half.</span>
          </p>
          <div className="flex flex-col items-start md:items-end gap-4">
            <button
              onClick={() => setLocation("/sign-up")}
              style={{ background: GREEN, color: "#0a0a0a" }}
              className="font-bold text-base px-10 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-105"
            >
              Get Started Free
            </button>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              No credit card. 2 minutes a day.
            </span>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1a1a1a" }} className="mt-20" />
      </section>

      {/* ── How it works ── */}
      <section className="px-8 md:px-16 py-16 max-w-6xl mx-auto">
        <div className="mb-12">
          <div
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.18em", color: "rgba(255,255,255,0.2)" }}
            className="text-xs font-semibold uppercase mb-3"
          >
            Simple by design
          </div>
          <h2
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            className="text-4xl md:text-5xl font-black uppercase text-white leading-tight"
          >
            How it <span style={{ color: GREEN }}>works</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div
            style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px" }}
            className="p-7"
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "48px",
                fontWeight: 900,
                color: `${GREEN}25`,
                lineHeight: 1,
                marginBottom: "16px",
              }}
            >
              01
            </div>
            <div
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}
              className="text-lg font-bold uppercase text-white mb-2"
            >
              Set up your profile
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", lineHeight: 1.6 }}>
              Pick your sport and level. Takes 30 seconds. Everything is personalised from there.
            </p>
          </div>

          {/* Step 2 */}
          <div
            style={{ background: "#111", border: `1px solid ${GREEN}30`, borderRadius: "16px" }}
            className="p-7"
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "48px",
                fontWeight: 900,
                color: GREEN,
                lineHeight: 1,
                marginBottom: "16px",
                opacity: 0.3,
              }}
            >
              02
            </div>
            <div
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}
              className="text-lg font-bold uppercase text-white mb-2"
            >
              Do your reps
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", lineHeight: 1.6 }}>
              Do your <span style={{ color: GREEN, fontWeight: 600 }}>Pre-Game Rep</span> before training or competition, and a <span style={{ color: "#60a5fa", fontWeight: 600 }}>Post-Game Rep</span> after to track how you actually performed. 2 minutes each.
            </p>
          </div>

          {/* Step 3 */}
          <div
            style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px" }}
            className="p-7"
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "48px",
                fontWeight: 900,
                color: `${GREEN}25`,
                lineHeight: 1,
                marginBottom: "16px",
              }}
            >
              03
            </div>
            <div
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}
              className="text-lg font-bold uppercase text-white mb-2"
            >
              Track your edge
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", lineHeight: 1.6 }}>
              See your mental patterns over time. Spot what works, fix what doesn't. Build the consistency that separates good athletes from great ones.
            </p>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1a1a1a" }} className="mt-16" />
      </section>

      {/* ── Check-In Preview ── */}
      <section className="px-8 md:px-16 py-12 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-16">
          {/* Left label */}
          <div className="md:w-64 shrink-0">
            <div
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)" }}
              className="text-xs font-semibold uppercase mb-3"
            >
              Daily ritual
            </div>
            <h2
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              className="text-4xl font-bold text-white uppercase leading-tight"
            >
              Your 2-minute
              <br />
              <span style={{ color: GREEN }}>check-in</span>
            </h2>
            <p className="mt-4 text-sm font-light" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
              Three questions. Every day. Build the habit of knowing where your head is before you compete.
            </p>
          </div>

          {/* Check-in card — exact replica of the real app */}
          <div className="flex-1 max-w-[520px]">
            {/* Header row */}
            <div className="mb-5">
              <div style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.18em" }} className="text-xs font-semibold uppercase mb-1">
                Monday, June 9
              </div>
              <div className="flex items-center gap-4">
                <h3
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}
                  className="text-4xl font-black uppercase text-white"
                >
                  Daily <span style={{ color: GREEN }}>Check-In</span>
                </h3>
                <span style={{ background: `${GREEN}18`, border: `1px solid ${GREEN}30`, color: GREEN, borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>
                  Lacrosse
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <PreviewScorePicker
                label="Focus"
                sublabel="How sharp is your focus today?"
                selected={8}
              />
              <PreviewScorePicker
                label="Confidence"
                sublabel="How confident do you feel going into training or competition?"
                selected={7}
              />
              <PreviewScorePicker
                label="Energy"
                sublabel="How is your energy level right now?"
                selected={6}
              />

              {/* Note */}
              <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }} className="p-5">
                <div style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em" }} className="text-xs font-semibold uppercase mb-3">
                  Notes <span style={{ color: "rgba(255,255,255,0.2)", textTransform: "none", fontWeight: 400, letterSpacing: "normal" }}>(optional)</span>
                </div>
                <div
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "13px",
                    fontStyle: "italic",
                    padding: "10px 12px",
                    lineHeight: 1.5,
                  }}
                >
                  Big game tomorrow. Staying present and not overthinking it.
                </div>
              </div>

              {/* Overall bar */}
              <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px" }} className="px-5 py-3 flex items-center justify-between">
                <span style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }} className="text-xs font-semibold uppercase">Overall</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: GREEN }} className="text-3xl font-black">
                  7.0
                </span>
              </div>

              {/* Submit button */}
              <div
                style={{
                  background: GREEN,
                  color: "#0a0a0a",
                  borderRadius: "12px",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: "0.08em",
                  width: "100%",
                  padding: "16px",
                  textAlign: "center",
                  fontWeight: 900,
                  fontSize: "15px",
                  textTransform: "uppercase",
                  opacity: 0.85,
                }}
              >
                Submit Check-In →
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1a1a1a" }} className="mt-20" />
      </section>

      {/* ── Community Feed Preview ── */}
      <section className="px-8 md:px-16 py-12 max-w-6xl mx-auto pb-24">
        <div className="flex flex-col md:flex-row md:items-start gap-16">
          {/* Left label */}
          <div className="md:w-64 shrink-0">
            <div
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)" }}
              className="text-xs font-semibold uppercase mb-3"
            >
              Anonymous
            </div>
            <h2
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              className="text-4xl font-bold text-white uppercase leading-tight"
            >
              Community
              <br />
              <span style={{ color: GREEN }}>Feed</span>
            </h2>
            <p className="mt-4 text-sm font-light" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
              See what athletes in your sport are mentally dealing with. Anonymous. No names. Just real minds.
            </p>
          </div>

          {/* Feed cards — exact replica of the real app */}
          <div className="flex-1 max-w-lg">
            {/* Feed header */}
            <div className="mb-5">
              <div style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.18em" }} className="text-xs font-semibold uppercase mb-1">
                Anonymous
              </div>
              <div className="flex items-center gap-3">
                <h3
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}
                  className="text-4xl font-black uppercase text-white"
                >
                  Community <span style={{ color: GREEN }}>Feed</span>
                </h3>
              </div>
              <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-sm mt-1 font-light">
                Lacrosse athletes being honest.
              </p>
            </div>

            <div className="space-y-3">
              {SAMPLE_FEED.map((post) => (
                <PreviewFeedCard key={post.id} {...post} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <div style={{ borderTop: "1px solid #141414", background: "#0d0d0d" }}>
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            className="text-2xl font-bold text-white uppercase tracking-wide"
          >
            Lock in your mind.
            <span style={{ color: GREEN }}> Start today.</span>
          </div>
          <button
            onClick={() => setLocation("/sign-up")}
            style={{ background: GREEN, color: "#0a0a0a" }}
            className="font-bold text-sm px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity shrink-0"
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}
