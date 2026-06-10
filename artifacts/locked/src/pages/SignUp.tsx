import { useState } from "react";
import { useLocation, Link } from "wouter";
import { supabase } from "@/lib/supabase";

const GREEN = "#00e5a0";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name.trim() },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (!data.session) {
      // Email confirmation required — show check-your-email message
      setError("Check your email to confirm your account, then sign in.");
      setLoading(false);
    } else {
      setLocation("/onboarding");
    }
  };

  return (
    <div
      style={{ background: "#0a0a0a", fontFamily: "'Barlow', sans-serif" }}
      className="min-h-screen text-white flex flex-col items-center justify-center px-6"
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/">
          <div
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", cursor: "pointer" }}
            className="text-2xl font-bold mb-10 inline-block"
          >
            <span className="text-white">Locke</span>
            <span style={{ color: GREEN }}>d</span>
          </div>
        </Link>

        <h1
          style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}
          className="text-4xl font-black uppercase mb-1"
        >
          Join <span style={{ color: GREEN }}>Locked</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)" }} className="text-sm mb-8 font-light">
          Start your mental performance journey
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }} className="block text-xs font-semibold uppercase mb-2">
              Name or handle
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan23, Coach Mike..."
              style={{
                background: "#111",
                border: "1px solid #1e1e1e",
                borderRadius: "10px",
                color: "white",
                fontFamily: "'Barlow', sans-serif",
                width: "100%",
                padding: "12px 14px",
              }}
              className="text-sm placeholder:text-white/20 focus:outline-none focus:border-[#00e5a0]/50 transition-colors"
            />
          </div>

          <div>
            <label style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }} className="block text-xs font-semibold uppercase mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                background: "#111",
                border: "1px solid #1e1e1e",
                borderRadius: "10px",
                color: "white",
                fontFamily: "'Barlow', sans-serif",
                width: "100%",
                padding: "12px 14px",
              }}
              className="text-sm placeholder:text-white/20 focus:outline-none focus:border-[#00e5a0]/50 transition-colors"
            />
          </div>

          <div>
            <label style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }} className="block text-xs font-semibold uppercase mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              style={{
                background: "#111",
                border: "1px solid #1e1e1e",
                borderRadius: "10px",
                color: "white",
                fontFamily: "'Barlow', sans-serif",
                width: "100%",
                padding: "12px 14px",
              }}
              className="text-sm placeholder:text-white/20 focus:outline-none focus:border-[#00e5a0]/50 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: GREEN,
              color: "#0a0a0a",
              borderRadius: "10px",
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.06em",
              width: "100%",
              padding: "14px",
            }}
            className="font-black text-base uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-sm text-center mt-6">
          Already have an account?{" "}
          <Link href="/sign-in">
            <span style={{ color: GREEN }} className="font-semibold cursor-pointer hover:opacity-80 transition-opacity">
              Sign in
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
