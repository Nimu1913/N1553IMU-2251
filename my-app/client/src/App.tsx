import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Appointments from "@/pages/appointments";
import Leads from "@/pages/leads";
import Vehicles from "@/pages/vehicles";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import marketing from "./pages/marketing";
import blocket from "./pages/blocket";
import Communications from "./pages/communications";
import AIStudio from "./pages/ai-studio";
// Add other page imports as needed

function App() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/appointments" component={Appointments} />
      <Route path="/leads" component={Leads} />
      <Route path="/vehicles" component={Vehicles} />
      <Route path="/ai-studio" component={AIStudio} />
      <Route path="/blocket" component={blocket} />
      <Route path="/communications" component={Communications} />
      {/* Add other routes like vehicles, ai-studio, blocket, etc. */}
    </Switch>
  );
}

function Router() {
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
      <Route component={NotFound} />
    </Switch>
  );
}
function AuthRouter() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect logic based on auth state
  useEffect(() => {
    if (!loading) {
      if (user && location === "/") {
        setLocation("/dashboard");
      } else if (!user && location !== "/") {
        setLocation("/");
      }
    }
  }, [user, loading, location, setLocation]);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Switch>
        <Route path="/">
          {user ? <Dashboard /> : <Login />}
        </Route>
        <Route path="/dashboard">
          {user ? <Dashboard /> : <Login />}
        </Route>
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
