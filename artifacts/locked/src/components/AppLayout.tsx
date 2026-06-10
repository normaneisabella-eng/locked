import { useLocation, Link } from "wouter";
import { useAuth } from "@/context/AuthContext";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const NAV_ITEMS = [
  { href: "/checkin", label: "Check-In" },
  { href: "/feed", label: "Community" },
  { href: "/history", label: "History" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useAuth();

  return (
    <div style={{ background: "#0a0a0a", fontFamily: "'Barlow', sans-serif" }} className="min-h-screen text-white flex flex-col">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <nav style={{ borderBottom: "1px solid #141414", background: "rgba(10,10,10,0.95)" }} className="sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/checkin">
            <span
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", cursor: "pointer" }}
              className="text-xl font-bold"
            >
              <span className="text-white">Locke</span>
              <span style={{ color: "#00e5a0" }}>d</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = location === item.href || location.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    data-testid={`nav-${item.href.slice(1)}`}
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      background: active ? "#00e5a0" : "transparent",
                      color: active ? "#0a0a0a" : "rgba(255,255,255,0.45)",
                      cursor: "pointer",
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:text-white"
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <button
            data-testid="button-sign-out"
            onClick={() => signOut().then(() => { window.location.href = basePath || "/"; })}
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Barlow', sans-serif" }}
            className="text-xs font-medium hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  );
}
