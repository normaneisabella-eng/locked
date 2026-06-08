import { usePushNotifications } from "@/hooks/usePushNotifications";

const GREEN = "#00e5a0";

export default function NotificationBanner() {
  const { state, loading, subscribe, unsubscribe } = usePushNotifications();

  if (state === "unsupported" || state === "denied") return null;

  if (state === "subscribed") {
    return (
      <div
        style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}25`, borderRadius: "12px" }}
        className="flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: GREEN }} />
          <span style={{ color: GREEN, fontFamily: "'Barlow', sans-serif" }} className="text-xs font-semibold">
            Daily reminders on
          </span>
        </div>
        <button
          onClick={unsubscribe}
          disabled={loading}
          style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Barlow', sans-serif" }}
          className="text-xs hover:text-white transition-colors disabled:opacity-40"
        >
          Turn off
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px" }} className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }} className="text-sm font-bold uppercase text-white mb-0.5">
            Daily reminders
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)" }} className="text-xs font-light">
            We'll nudge you at 7 PM if you haven't checked in yet.
          </p>
        </div>
        <button
          data-testid="button-enable-notifications"
          onClick={subscribe}
          disabled={loading}
          style={{ background: GREEN, color: "#0a0a0a", borderRadius: "8px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em", flexShrink: 0 }}
          className="text-xs font-black uppercase px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? "..." : "Enable"}
        </button>
      </div>
    </div>
  );
}
