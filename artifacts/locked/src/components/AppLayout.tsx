import { useLocation, Link } from "wouter";
import { useClerk, useUser } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const NAV_ITEMS = [
  { href: "/checkin", label: "Check-In" },
  { href: "/feed", label: "Community" },
  { href: "/history", label: "History" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/checkin">
            <span className="font-display text-lg text-primary tracking-widest cursor-pointer">LOCKED</span>
          </Link>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = location === item.href || location.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    data-testid={`nav-${item.href.slice(1)}`}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <button
            data-testid="button-sign-out"
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  );
}
