import { useLocation } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const SPORTS = ["Basketball", "Soccer", "Football", "Swimming", "Tennis", "CrossFit", "MMA", "Track & Field"];

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <img src={`${basePath}/logo.svg`} alt="Locked" className="w-8 h-8" />
          <span className="font-display text-xl text-primary tracking-widest">LOCKED</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-testid="button-sign-in"
            onClick={() => setLocation("/sign-in")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
          >
            Sign in
          </button>
          <button
            data-testid="button-get-started"
            onClick={() => setLocation("/sign-up")}
            className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
          Mental Performance Training
        </div>
        <h1 className="font-display text-7xl md:text-8xl text-foreground leading-none mb-6 tracking-wide">
          TRAIN YOUR<br />
          <span className="text-primary">MIND DAILY</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mb-10 leading-relaxed">
          Elite athletes train their bodies every day. The best also train their minds. A 2-minute daily check-in to track focus, confidence, and energy — and see how your sport community performs mentally.
        </p>
        <div className="flex items-center gap-4">
          <button
            data-testid="button-hero-cta"
            onClick={() => setLocation("/sign-up")}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-base hover:opacity-90 transition-all hover:scale-105 shadow-lg"
          >
            Start your streak today
          </button>
          <button
            data-testid="button-hero-signin"
            onClick={() => setLocation("/sign-in")}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors px-4 py-4"
          >
            Already a member? Sign in
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border px-6 py-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              label: "Daily Check-In",
              desc: "3 questions. 2 minutes. Track focus, confidence, and energy every day."
            },
            {
              label: "Community Feed",
              desc: "See how athletes in your sport are performing mentally — all anonymous."
            },
            {
              label: "Personal Patterns",
              desc: "Visualize your mental trends over time. See what fuels your best performances."
            },
          ].map((f) => (
            <div key={f.label} className="bg-card border border-card-border rounded-xl p-6">
              <div className="w-2 h-2 bg-primary rounded-full mb-4" />
              <h3 className="font-display text-xl tracking-wide text-foreground mb-2">{f.label}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sports */}
      <section className="border-t border-border px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-muted-foreground text-xs tracking-widest uppercase mb-6">For every athlete</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SPORTS.map((s) => (
              <span key={s} className="bg-secondary text-secondary-foreground text-xs px-3 py-1.5 rounded-full border border-border">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-muted-foreground text-xs">
        Locked &mdash; Mental performance for athletes
      </footer>
    </div>
  );
}
