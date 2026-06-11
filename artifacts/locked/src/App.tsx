import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProfileProvider, useProfile } from "@/context/ProfileContext";
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

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, session } = useAuth();
  const { profile } = useProfile();
  const [location] = useLocation();

  // Wait for auth and profile to resolve
  if (!isLoaded || (session && profile === undefined)) return null;

  // Not signed in → landing
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
        <ProfileProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <AppRoutes />
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </ProfileProvider>
      </AuthProvider>
    </WouterRouter>
  );
}

export default App;
