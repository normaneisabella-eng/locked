import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import Checkin from "@/pages/Checkin";
import Feed from "@/pages/Feed";
import History from "@/pages/History";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#FF5C1A",
    colorForeground: "#EDF2F7",
    colorMutedForeground: "#718096",
    colorBackground: "#0D0F14",
    colorInput: "#1A1D26",
    colorInputForeground: "#EDF2F7",
    colorDanger: "#E53E3E",
    colorNeutral: "#2D3748",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#0D0F14] border border-[#2D3748] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#EDF2F7] font-bold",
    headerSubtitle: "text-[#718096]",
    socialButtonsBlockButtonText: "text-[#EDF2F7]",
    formFieldLabel: "text-[#A0AEC0] text-sm",
    footerActionLink: "text-[#FF5C1A]",
    footerActionText: "text-[#718096]",
    dividerText: "text-[#718096]",
    identityPreviewEditButton: "text-[#FF5C1A]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-[#EDF2F7]",
    logoBox: "mb-2",
    logoImage: "h-10 w-10",
    socialButtonsBlockButton: "bg-[#1A1D26] border-[#2D3748] hover:bg-[#252836]",
    formButtonPrimary: "bg-[#FF5C1A] hover:bg-[#FF7040] text-white font-semibold",
    formFieldInput: "bg-[#1A1D26] border-[#2D3748] text-[#EDF2F7] placeholder:text-[#4A5568]",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#2D3748]",
    alert: "bg-[#1A1D26] border-[#2D3748]",
    otpCodeFieldInput: "bg-[#1A1D26] border-[#2D3748] text-[#EDF2F7]",
    formFieldRow: "gap-2",
    main: "gap-4",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const { data: me, isLoading, isError } = useGetMe({ query: { enabled: isLoaded && !!isSignedIn, queryKey: getGetMeQueryKey() } });
  const [location] = useLocation();

  if (!isLoaded || isLoading) return null;
  if (!isSignedIn) return <>{children}</>;

  const needsOnboarding = isError || !me;
  if (needsOnboarding && location !== "/onboarding") {
    return <Redirect to="/onboarding" />;
  }
  if (!needsOnboarding && location === "/onboarding") {
    return <Redirect to="/checkin" />;
  }

  return <>{children}</>;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/checkin" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function AppRoutes() {
  return (
    <OnboardingGate>
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/checkin" component={() => <ProtectedRoute component={Checkin} />} />
        <Route path="/feed" component={() => <ProtectedRoute component={Feed} />} />
        <Route path="/history" component={() => <ProtectedRoute component={History} />} />
        <Route component={NotFound} />
      </Switch>
    </OnboardingGate>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your Locked account",
          },
        },
        signUp: {
          start: {
            title: "Join Locked",
            subtitle: "Start your mental performance journey",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <AppRoutes />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
