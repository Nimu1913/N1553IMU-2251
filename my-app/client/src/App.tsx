import { Switch, Route, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Appointments from "@/pages/appointments";
import Leads from "@/pages/leads";
import Vehicles from "@/pages/vehicles";
import AIStudio from "@/pages/ai-studio";
import Blocket from "@/pages/blocket";
import Marketing from "@/pages/marketing";
import Communications from "@/pages/communications";
import Deals from "@/pages/deals";
import Settings from "@/pages/settings";
import Support from "@/pages/support";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

const queryClient = new QueryClient();

function Router() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to dashboard if logged in and on login page
  useEffect(() => {
    if (user && (location === "/" || location === "/login")) {
      setLocation("/dashboard");
    }
  }, [user, location, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/appointments">
        <ProtectedRoute>
          <Appointments />
        </ProtectedRoute>
      </Route>
      <Route path="/leads">
        <ProtectedRoute>
          <Leads />
        </ProtectedRoute>
      </Route>
      <Route path="/vehicles">
        <ProtectedRoute>
          <Vehicles />
        </ProtectedRoute>
      </Route>
      <Route path="/ai-studio">
        <ProtectedRoute>
          <AIStudio />
        </ProtectedRoute>
      </Route>
      <Route path="/blocket">
        <ProtectedRoute>
          <Blocket />
        </ProtectedRoute>
      </Route>
      <Route path="/marketing">
        <ProtectedRoute>
          <Marketing />
        </ProtectedRoute>
      </Route>
      <Route path="/communications">
        <ProtectedRoute>
          <Communications />
        </ProtectedRoute>
      </Route>
      <Route path="/deals">
        <ProtectedRoute>
          <Deals />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route path="/support">
        <ProtectedRoute>
          <Support />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;