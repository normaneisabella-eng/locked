import { useState } from "react";
import { useLocation } from "wouter";
import { useUpsertMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

const SPORTS = [
  "Basketball", "Soccer", "Football", "Baseball", "Tennis",
  "Swimming", "Track & Field", "CrossFit", "MMA", "Gymnastics",
  "Volleyball", "Cycling", "Hockey", "Rowing", "Wrestling",
  "Golf", "Rugby", "Lacrosse", "Other",
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [sport, setSport] = useState("");
  const [displayName, setDisplayName] = useState("");
  const queryClient = useQueryClient();
  const upsertMe = useUpsertMe();

  const handleSubmit = () => {
    if (!sport || !displayName.trim()) return;
    upsertMe.mutate(
      { data: { sport, displayName: displayName.trim() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setLocation("/checkin");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="font-display text-4xl text-primary tracking-widest mb-2">LOCKED</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Set up your profile</h1>
          <p className="text-muted-foreground text-sm">Tell us about yourself to get started</p>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 space-y-6">
          {/* Display name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Your name or handle</label>
            <input
              data-testid="input-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Jordan23, Coach Mike..."
              className="w-full bg-background border border-input rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Sport selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Your sport</label>
            <div className="grid grid-cols-3 gap-2">
              {SPORTS.map((s) => (
                <button
                  key={s}
                  data-testid={`button-sport-${s}`}
                  onClick={() => setSport(s)}
                  className={`text-xs px-2 py-2.5 rounded-lg border transition-all font-medium ${
                    sport === s
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-secondary border-border text-secondary-foreground hover:border-primary/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            data-testid="button-complete-onboarding"
            onClick={handleSubmit}
            disabled={!sport || !displayName.trim() || upsertMe.isPending}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {upsertMe.isPending ? "Setting up..." : "Get locked in"}
          </button>

          {upsertMe.isError && (
            <p className="text-destructive text-xs text-center">Something went wrong. Try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}
