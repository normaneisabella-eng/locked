import { useState, useRef, useEffect } from "react";
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

// ── OTP verification screen ───────────────────────────────────────────────────

function OtpScreen({
  email,
  onSuccess,
}: {
  email: string;
  onSuccess: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Allow only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 filled
    if (digit && index === 5) {
      const code = [...next].join("");
      if (code.length === 6) verifyCode(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    setError(null);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
    if (pasted.length === 6) verifyCode(pasted);
  };

  const verifyCode = async (code: string) => {
    setLoading(true);
    setError(null);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (verifyError) {
      setError("Incorrect code. Please try again.");
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } else {
      onSuccess();
    }
  };

  const handleResend = async () => {
    setResent(false);
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (!resendError) setResent(true);
  };

  const code = digits.join("");

  return (
    <div className="w-full max-w-sm">
      {/* Envelope icon */}
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
        className="text-4xl font-black uppercase mb-2"
      >
        Check your<br />
        <span style={{ color: GREEN }}>email</span>
      </h1>
      <p style={{ color: "rgba(255,255,255,0.4)" }} className="text-sm font-light mb-1">
        We sent a 6-digit code to
      </p>
      <p style={{ color: "rgba(255,255,255,0.7)" }} className="text-sm font-semibold mb-8 break-all">
        {email}
      </p>

      {/* 6-digit boxes */}
      <div className="flex gap-3 mb-6">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={loading}
            style={{
              width: "100%",
              aspectRatio: "1",
              background: d ? `${GREEN}12` : "#111",
              border: `1.5px solid ${d ? GREEN : error ? "#ef4444" : "#1e1e1e"}`,
              borderRadius: "12px",
              color: d ? GREEN : "white",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "28px",
              fontWeight: 800,
              textAlign: "center",
              caretColor: "transparent",
              transition: "border-color 0.15s, background 0.15s",
            }}
            className="focus:outline-none"
          />
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-xs mb-4 text-center">{error}</p>
      )}

      {loading && (
        <p style={{ color: GREEN }} className="text-xs text-center mb-4">
          Verifying…
        </p>
      )}

      {/* Manual verify button (in case auto-submit didn't fire) */}
      {!loading && code.length === 6 && (
        <button
          onClick={() => verifyCode(code)}
          style={{
            background: GREEN,
            color: "#0a0a0a",
            borderRadius: "10px",
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: "0.06em",
            width: "100%",
            padding: "14px",
          }}
          className="font-black text-base uppercase tracking-wide hover:opacity-90 transition-opacity mb-4"
        >
          Verify Code →
        </button>
      )}

      <div className="text-center">
        <span style={{ color: "rgba(255,255,255,0.35)" }} className="text-sm">
          Didn't get it?{" "}
        </span>
        <button
          onClick={handleResend}
          style={{ color: resent ? GREEN : "rgba(255,255,255,0.6)" }}
          className="text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          {resent ? "Code sent ✓" : "Resend code"}
        </button>
      </div>
    </div>
  );
}

// ── Sign-up form ──────────────────────────────────────────────────────────────

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
      // Email confirmation required — show OTP screen
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
        <OtpScreen
          email={pendingEmail}
          onSuccess={() => setLocation("/onboarding")}
        />
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
