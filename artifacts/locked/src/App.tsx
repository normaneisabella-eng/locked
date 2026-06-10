import { useEffect, useState } from "react";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Landing from "@/pages/Landing";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Onboarding from "@/pages/Onboarding";
import Checkin from "@/pages/Checkin";
import Feed from "@/pages/Feed";
import History from "@/pages/History";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

type Profile = { id: string; handle: string; sport: string; level: string };

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, session, user } = useAuth();
  // undefined = still loading, null = no profile
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [location] = useLocation();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    setProfile(undefined); // reset while fetching
    supabase
      .from("profiles")
      .select("id, handle, sport, level")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data ?? null));
  }, [user?.id]);

  // Still waiting for auth to load, or for profile fetch to complete
  if (!isLoaded || (session && profile === undefined)) return null;

  // Not signed in → send to landing
  if (!session) return <Redirect to="/" />;

  const needsOnboarding = !profile;
  if (needsOnboarding && location !== "/onboarding") return <Redirect to="/onboarding" />;
  if (!needsOnboarding && location === "/onboarding") return <Redirect to="/checkin" />;

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />

      <Route path="/onboarding">
        <OnboardingGate>
          <Onboarding />
        </OnboardingGate>
      </Route>
      <Route path="/checkin">
        <OnboardingGate>
          <Checkin />
        </OnboardingGate>
      </Route>
      <Route path="/feed">
        <OnboardingGate>
          <Feed />
        </OnboardingGate>
      </Route>
      <Route path="/history">
        <OnboardingGate>
          <History />
        </OnboardingGate>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AppRoutes />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </WouterRouter>
  );
}

export default App;
