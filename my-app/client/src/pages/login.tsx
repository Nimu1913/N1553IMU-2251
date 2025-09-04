import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Calendar, TrendingUp, Users, Sparkles } from "lucide-react";
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

  // Animated stars background
  useEffect(() => {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star: any) => {
      star.style.animationDelay = `${Math.random() * 5}s`;
    });
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated starfield background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="flex min-h-screen relative z-10">
        {/* Left Panel - Marketing */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between backdrop-blur-sm">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform">
                <Car className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">TestRide.io</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <p className="text-blue-200">The #1 scheduling platform for car salespeople</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Book More Test Drives</h3>
                <p className="text-blue-200 mt-1">
                  Convert walk-ins instantly with QR codes and quick booking
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Track Your Performance</h3>
                <p className="text-blue-200 mt-1">
                  See your conversion rates and commission projections in real-time
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Manage Leads Better</h3>
                <p className="text-blue-200 mt-1">
                  Never miss a follow-up with automated reminders and templates
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <p className="text-blue-200 text-sm">Trusted by top performers</p>
            <p className="text-white text-2xl font-bold mt-2 bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
              Average user sells 3 more cars per month
            </p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl transform hover:scale-110 transition-transform">
                <Car className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-gray-300">
                Sign in to manage your appointments and leads
              </p>
            </div>

            <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Sign In</CardTitle>
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
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500/20"
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
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transform hover:scale-[1.02] transition-all" 
                    disabled={loading}
                    data-testid="button-login"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-center text-gray-600">
                    Demo credentials: john@automax.com / password
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}