import { useLocation } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const SAMPLE_FEED = [
  {
    id: 1,
    sport: "Lacrosse",
    time: "14m ago",
    head: 4,
    weighing: "Big playoff game tomorrow. Overthinking it.",
    win: "Play my game, not theirs.",
  },
  {
    id: 2,
    sport: "Lacrosse",
    time: "1h ago",
    head: 3,
    weighing: "Missed a few passes at practice. Stuck in my head.",
    win: "Two clean feeds in the first half.",
  },
  {
    id: 3,
    sport: "Lacrosse",
    time: "2h ago",
    head: 5,
    weighing: "Nothing today. Feeling dialed in.",
    win: "Lead by example. One big defensive stop.",
  },
  {
    id: 4,
    sport: "Lacrosse",
    time: "3h ago",
    head: 2,
    weighing: "Coach chewed me out. Hard to shake it.",
    win: "Keep my composure and finish strong.",
  },
];

function HeadDots({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: i <= value ? "#00e5a0" : "#222" }}
        />
      ))}
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
      {/* Google Fonts */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Barlow:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ── Navbar ───────────────────────────────────────────────────── */}
      <nav
        style={{ borderBottom: "1px solid #141414" }}
        className="flex items-center justify-between px-8 md:px-16 py-5"
      >
        {/* Logo */}
        <div
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
          className="text-2xl font-bold tracking-widest"
        >
          <span className="text-white">Locke</span>
          <span style={{ color: "#00e5a0" }}>d</span>
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
            style={{ background: "#00e5a0", color: "#0a0a0a" }}
            className="text-sm font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="px-8 md:px-16 pt-24 pb-20 max-w-6xl mx-auto">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-10">
          <div style={{ background: "#00e5a0", width: "32px", height: "2px" }} />
          <span
            style={{ color: "#00e5a0", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.2em" }}
            className="text-xs font-semibold uppercase tracking-widest"
          >
            Mental Performance
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 0.9 }}
          className="text-[clamp(72px,12vw,160px)] font-black uppercase leading-none mb-8"
        >
          <span className="block text-white">Train</span>
          <span className="block" style={{ color: "#00e5a0" }}>Your</span>
          <span
            className="block"
            style={{
              WebkitTextStroke: "2px #fff",
              color: "transparent",
            }}
          >
            Mind
          </span>
        </h1>

        {/* Subhead + CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mt-10">
          <p
            className="text-xl md:text-2xl font-light max-w-md"
            style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}
          >
            You train your body every day.
            <br />
            <span className="text-white font-medium">Your mind is the other half.</span>
          </p>

          <div className="flex flex-col items-start md:items-end gap-4">
            <button
              onClick={() => setLocation("/sign-up")}
              style={{ background: "#00e5a0", color: "#0a0a0a" }}
              className="font-bold text-base px-10 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-105"
            >
              Get Started Free
            </button>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              No credit card. 2 minutes a day.
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #1a1a1a" }} className="mt-20" />
      </section>

      {/* ── Daily Check-In Card Preview ──────────────────────────────── */}
      <section className="px-8 md:px-16 py-12 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-16">
          {/* Left label */}
          <div className="md:w-64 shrink-0">
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.2)",
              }}
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
              <span style={{ color: "#00e5a0" }}>check-in</span>
            </h2>
            <p className="mt-4 text-sm font-light" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
              Three questions. Every day. Build the habit of knowing where your head is before you compete.
            </p>
          </div>

          {/* Card */}
          <div className="flex-1">
            <div
              style={{
                background: "#111",
                border: "1px solid #1e1e1e",
                borderRadius: "16px",
                maxWidth: "520px",
              }}
              className="p-8"
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#00e5a0", letterSpacing: "0.15em" }}
                    className="text-xs font-semibold uppercase mb-1"
                  >
                    Monday, June 8
                  </div>
                  <div
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    className="text-2xl font-bold text-white uppercase"
                  >
                    Daily Check-In
                  </div>
                </div>
                <div
                  style={{ background: "#00e5a0", borderRadius: "50%", width: "40px", height: "40px" }}
                  className="flex items-center justify-center"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a5 5 0 0 1 5 5v2H7V7a5 5 0 0 1 5-5z" />
                    <rect x="3" y="9" width="18" height="13" rx="2" />
                    <circle cx="12" cy="15" r="1.5" fill="#0a0a0a" />
                  </svg>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-7">
                {/* Q1 */}
                <div>
                  <div
                    className="text-sm font-medium mb-3"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    01 &nbsp; How's your head today?
                  </div>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "10px",
                          background: n === 4 ? "#00e5a0" : "#1a1a1a",
                          color: n === 4 ? "#0a0a0a" : "rgba(255,255,255,0.4)",
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: "18px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: n === 4 ? "none" : "1px solid #222",
                        }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q2 */}
                <div>
                  <div
                    className="text-sm font-medium mb-2"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    02 &nbsp; What's weighing on you?
                  </div>
                  <div
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid #222",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      color: "rgba(255,255,255,0.25)",
                      fontSize: "14px",
                      fontStyle: "italic",
                    }}
                  >
                    Big game tomorrow. Trying to stay present.
                  </div>
                </div>

                {/* Q3 */}
                <div>
                  <div
                    className="text-sm font-medium mb-2"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    03 &nbsp; What would make today a win?
                  </div>
                  <div
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid #222",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      color: "rgba(255,255,255,0.25)",
                      fontSize: "14px",
                      fontStyle: "italic",
                    }}
                  >
                    Lock in at practice. Full effort.
                  </div>
                </div>

                {/* Submit button */}
                <button
                  style={{ background: "#00e5a0", color: "#0a0a0a", width: "100%", padding: "14px", borderRadius: "10px" }}
                  className="font-bold text-sm opacity-60 cursor-default"
                  disabled
                >
                  Submit check-in
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #1a1a1a" }} className="mt-20" />
      </section>

      {/* ── Community Feed ───────────────────────────────────────────── */}
      <section className="px-8 md:px-16 py-12 max-w-6xl mx-auto pb-24">
        <div className="flex flex-col md:flex-row md:items-start gap-16">
          {/* Left label */}
          <div className="md:w-64 shrink-0">
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.2)",
              }}
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
              <span style={{ color: "#00e5a0" }}>Feed</span>
            </h2>
            <p className="mt-4 text-sm font-light" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
              See what athletes in your sport are mentally dealing with. Anonymous. No names. Just real minds.
            </p>
          </div>

          {/* Feed posts */}
          <div className="flex-1 space-y-4 max-w-lg">
            {SAMPLE_FEED.map((post) => (
              <div
                key={post.id}
                style={{
                  background: "#111",
                  border: "1px solid #1e1e1e",
                  borderRadius: "14px",
                  padding: "20px 24px",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        background: "#1a1a1a",
                        border: "1px solid #222",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        color: "#00e5a0",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {post.sport}
                    </div>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>{post.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Head</span>
                    <HeadDots value={post.head} />
                  </div>
                </div>

                <div className="space-y-2">
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                    <span style={{ color: "rgba(255,255,255,0.25)", marginRight: "6px" }}>⚖</span>
                    {post.weighing}
                  </p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                    <span style={{ color: "#00e5a0", marginRight: "6px" }}>→</span>
                    {post.win}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA strip ─────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid #141414", background: "#0d0d0d" }}>
        <div className="max-w-6xl mx-auto px-8 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            className="text-2xl font-bold text-white uppercase tracking-wide"
          >
            Lock in your mind.
            <span style={{ color: "#00e5a0" }}> Start today.</span>
          </div>
          <button
            onClick={() => setLocation("/sign-up")}
            style={{ background: "#00e5a0", color: "#0a0a0a" }}
            className="font-bold text-sm px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity shrink-0"
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}
