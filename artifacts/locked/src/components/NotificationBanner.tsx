import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function NotificationBanner() {
  const { state, loading, subscribe, unsubscribe } = usePushNotifications();

  if (state === "unsupported" || state === "denied" || state === "subscribed") {
    if (state === "subscribed") {
      return (
        <div className="flex items-center justify-between bg-green-950/40 border border-green-800/40 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-400 font-medium">Daily reminders on</span>
          </div>
          <button
            onClick={unsubscribe}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Turn off
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-card border border-card-border rounded-xl px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-foreground mb-0.5">Get daily reminders</div>
          <p className="text-xs text-muted-foreground">
            We'll nudge you at 7 PM if you haven't checked in yet.
          </p>
        </div>
        <button
          data-testid="button-enable-notifications"
          onClick={subscribe}
          disabled={loading}
          className="shrink-0 text-xs bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "..." : "Enable"}
        </button>
      </div>
    </div>
  );
}
