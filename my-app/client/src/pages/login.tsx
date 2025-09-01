import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Calendar, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      setLocation("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="flex min-h-screen">
        {/* Left Panel - Marketing */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">TestDriveNow</h1>
            <p className="text-blue-100">The #1 scheduling platform for car salespeople</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <Calendar className="w-8 h-8 text-blue-200 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold text-lg">Book More Test Drives</h3>
                <p className="text-blue-100 mt-1">
                  Convert walk-ins instantly with QR codes and quick booking
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <TrendingUp className="w-8 h-8 text-blue-200 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold text-lg">Track Your Performance</h3>
                <p className="text-blue-100 mt-1">
                  See your conversion rates and commission projections in real-time
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Users className="w-8 h-8 text-blue-200 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold text-lg">Manage Leads Better</h3>
                <p className="text-blue-100 mt-1">
                  Never miss a follow-up with automated reminders and templates
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-700/50 rounded-lg p-6">
            <p className="text-blue-100 text-sm">Trusted by top performers</p>
            <p className="text-white text-2xl font-bold mt-2">
              Average user sells 3 more cars per month
            </p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Car className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
              <p className="text-muted-foreground mt-2">
                Sign in to manage your appointments and leads
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Use your credentials to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@automax.com"
                      required
                      data-testid="input-email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      data-testid="input-password"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                    data-testid="button-login"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Demo credentials: john@automax.com / password
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
