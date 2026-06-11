import { useState } from "react";
import { useLocation, Link } from "wouter";
import { supabase } from "@/lib/supabase";

const GREEN = "#00e5a0";

const inputStyle = {
  background: "#111",
  border: "1px solid #1e1e1e",
  borderRadius: "10px",
  color: "white",
  fontFamily: "'Barlow', sans-serif",
  width: "100%",
  padding: "12px 14px",
} as const;

function Fonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </>
  );
}

function ConfirmScreen({ email }: { email: string }) {
  return (
    <div className="w-full max-w-sm">
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: `${GREEN}18`,
          border: `1px solid ${GREEN}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            stroke={GREEN}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1
        style={{ fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}
        className="text-4xl font-black uppercase mb-3"
      >
        Check your<br />
        <span style={{ color: GREEN }}>email</span>
      </h1>

      <p style={{ color: "rgba(255,255,255,0.5)" }} className="text-sm font-light mb-2">
        We sent a confirmation link to
      </p>
      <p style={{ color: "rgba(255,255,255,0.8)" }} className="text-sm font-semibold mb-6 break-all">
        {email}
      </p>

      <div
        style={{
          background: "#111",
          border: "1px solid #1e1e1e",
          borderRadius: "14px",
          padding: "20px 22px",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.6)" }} className="text-sm leading-relaxed">
          Click the confirmation link in the email to activate your account. Then come back and sign in.
        </p>
      </div>

      <Link href="/sign-in">
        <button
          style={{
            background: GREEN,
            color: "#0a0a0a",
            borderRadius: "10px",
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: "0.06em",
            width: "100%",
            padding: "14px",
            marginTop: "24px",
          }}
          className="font-black text-base uppercase tracking-wide hover:opacity-90 transition-opacity"
        >
          Go to Sign In →
        </button>
      </Link>
    </div>
  );
}

export default function SignUp() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name.trim() } },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
    } else if (data.session) {
      // Email confirmation disabled — signed in straight away
      setLocation("/onboarding");
    } else {
      // Email confirmation required — show confirmation screen
      setPendingEmail(email);
    }
  };

  if (pendingEmail) {
    return (
      <div
        style={{ background: "#0a0a0a", fontFamily: "'Barlow', sans-serif" }}
        className="min-h-screen text-white flex flex-col items-center justify-center px-6"
      >
        <Fonts />
        <ConfirmScreen email={pendingEmail} />
      </div>
    );
  }

  return (
    <div
      style={{ background: "#0a0a0a", fontFamily: "'Barlow', sans-serif" }}
      className="min-h-screen text-white flex flex-col items-center justify-center px-6"
    >
      <Fonts />

      <div className="w-full max-w-sm">
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
              style={inputStyle}
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
              style={inputStyle}
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
              style={inputStyle}
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
