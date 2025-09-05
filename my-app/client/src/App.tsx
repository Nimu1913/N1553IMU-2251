import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/auth-provider";
import { LanguageProvider } from "@/contexts/language-context";
import { MetricsProvider } from "@/contexts/metrics-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { AccountProvider } from "@/contexts/account-context";
import SimpleLoginPage from "@/pages/simple-login";
import SimpleDashboard from "@/pages/simple-dashboard";
import VehiclesPage from "@/pages/vehicles-page";
import AppointmentsPage from "@/pages/appointments-page";
import LeadsPage from "@/pages/leads-page";
import AIStudioPage from "@/pages/ai-studio-page";
import BlocketPage from "@/pages/blocket-page";
import MarketingPage from "@/pages/marketing-page";
import CommunicationsPage from "@/pages/communications-page";
import DealsPage from "@/pages/deals-page";
import SettingsPage from "@/pages/settings-page";
import SupportPage from "@/pages/support-page";

const queryClient = new QueryClient();


function Router() {
  return (
    <Switch>
      <Route path="/" component={SimpleLoginPage} />
      <Route path="/login" component={SimpleLoginPage} />
      <Route path="/dashboard" component={SimpleDashboard} />
      <Route path="/vehicles" component={VehiclesPage} />
      <Route path="/appointments" component={AppointmentsPage} />
      <Route path="/leads" component={LeadsPage} />
      <Route path="/ai-studio" component={AIStudioPage} />
      <Route path="/blocket" component={BlocketPage} />
      <Route path="/marketing" component={MarketingPage} />
      <Route path="/communications" component={CommunicationsPage} />
      <Route path="/deals" component={DealsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/support" component={SupportPage} />
      <Route path="*">
        <div className="min-h-screen bg-black text-white p-8">
          <h1 className="text-2xl">Page not found</h1>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            <MetricsProvider>
              <AuthProvider>
                <AccountProvider>
                  <Router />
                  <Toaster />
                </AccountProvider>
              </AuthProvider>
            </MetricsProvider>
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;