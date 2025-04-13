import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/layout/Navbar";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/index";
import AuthPage from "@/pages/auth";
import DebugPage from "@/pages/debug";
import InvestorDashboard from "@/pages/investor/dashboard";
import DiscoverStartups from "@/pages/investor/discover";
import InvestorTransactions from "@/pages/investor/transactions";
import InvestorMessages from "@/pages/investor/messages";
import StartupDashboard from "@/pages/startup/dashboard";
import CreateStartup from "@/pages/startup/create";
import StartupTransactions from "@/pages/startup/transactions";
import StartupMessages from "@/pages/startup/messages";
import StartupProfile from "@/pages/startup/profile";
import Settings from "@/pages/settings";
import { useAuth } from "./hooks/useAuth";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-light-200 dark:bg-dark-300 text-gray-800 dark:text-gray-100 transition-colors">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={LandingPage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/debug" component={DebugPage} />
          
          {/* Protected investor routes */}
          <Route path="/investor/dashboard">
            {user && user.role === 'investor' ? <InvestorDashboard /> : <AuthPage />}
          </Route>
          <Route path="/investor/discover">
            {user && user.role === 'investor' ? <DiscoverStartups /> : <AuthPage />}
          </Route>
          <Route path="/investor/transactions">
            {user && user.role === 'investor' ? <InvestorTransactions /> : <AuthPage />}
          </Route>
          <Route path="/investor/messages">
            {user && user.role === 'investor' ? <InvestorMessages /> : <AuthPage />}
          </Route>
          
          {/* Protected startup routes */}
          <Route path="/startup/dashboard">
            {user && user.role === 'startup' ? <StartupDashboard /> : <AuthPage />}
          </Route>
          <Route path="/startup/create">
            {user && user.role === 'startup' ? <CreateStartup /> : <AuthPage />}
          </Route>
          <Route path="/startup/transactions">
            {user && user.role === 'startup' ? <StartupTransactions /> : <AuthPage />}
          </Route>
          <Route path="/startup/messages">
            {user && user.role === 'startup' ? <StartupMessages /> : <AuthPage />}
          </Route>
          <Route path="/startup/profile">
            {user && user.role === 'startup' ? <StartupProfile /> : <AuthPage />}
          </Route>
          
          {/* Shared routes */}
          <Route path="/settings">
            {user ? <Settings /> : <AuthPage />}
          </Route>
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
