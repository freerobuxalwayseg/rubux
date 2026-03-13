import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";

// Pages
import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import InvitePage from "@/pages/invite";
import LevelsPage from "@/pages/levels";
import RewardsPage from "@/pages/rewards";
import RareItemsPage from "@/pages/rare-items";
import LeaderboardPage from "@/pages/leaderboard";
import EarningsPage from "@/pages/earnings";
import WithdrawPage from "@/pages/withdraw";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin";

// --- Global Fetch Interceptor for Auth Token ---
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();
  if (url.startsWith("/api")) {
    const token = localStorage.getItem("roblox_token");
    if (token) {
      init = init || {};
      init.headers = { ...init.headers, Authorization: `Bearer ${token}` };
    }
  }
  return originalFetch(input, init);
};
// -----------------------------------------------

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold bg-background">جاري التحميل...</div>;
  if (!user) return <Redirect to="/auth" />;
  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background" />;

  return (
    <Switch>
      {/* Public routes — no navbar */}
      <Route path="/">
        {user ? <Redirect to="/dashboard" /> : <LandingPage />}
      </Route>
      <Route path="/auth">
        {user ? <Redirect to="/dashboard" /> : <AuthPage />}
      </Route>

      {/* Admin dashboard — outside normal layout */}
      <Route path="/admin"><ProtectedRoute component={AdminPage} /></Route>

      {/* App routes — wrapped in navbar Layout */}
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/invite"><ProtectedRoute component={InvitePage} /></Route>
      <Route path="/levels"><ProtectedRoute component={LevelsPage} /></Route>
      <Route path="/rewards"><ProtectedRoute component={RewardsPage} /></Route>
      <Route path="/rare-items"><ProtectedRoute component={RareItemsPage} /></Route>
      <Route path="/leaderboard"><ProtectedRoute component={LeaderboardPage} /></Route>
      <Route path="/earnings"><ProtectedRoute component={EarningsPage} /></Route>
      <Route path="/withdraw"><ProtectedRoute component={WithdrawPage} /></Route>
      <Route path="/profile"><ProtectedRoute component={ProfilePage} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Layout>
              <Router />
            </Layout>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
