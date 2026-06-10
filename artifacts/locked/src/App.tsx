import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
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

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, session } = useAuth();
  const { data: me, isLoading, isError } = useGetMe({
    query: { enabled: isLoaded && !!session, queryKey: getGetMeQueryKey() },
  });
  const [location] = useLocation();

  if (!isLoaded || (session && isLoading)) return null;
  if (!session) return <Redirect to="/" />;

  const needsOnboarding = isError || !me;
  if (needsOnboarding && location !== "/onboarding") {
    return <Redirect to="/onboarding" />;
  }
  if (!needsOnboarding && location === "/onboarding") {
    return <Redirect to="/checkin" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Switch>
      {/* Always-public routes */}
      <Route path="/" component={Landing} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />

      {/* Protected routes */}
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
