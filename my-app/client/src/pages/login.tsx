import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [terminalText, setTerminalText] = useState("");
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const fullText = "TESTRIDE.IO_SYSTEM_V2.4.1_INITIALIZED";

  // Redirect if already logged in
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  // Terminal typing effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTerminalText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      setLocation("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AUTH_ERROR",
        description: error instanceof Error ? error.message : "SYSTEM_FAILURE",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)',
          backgroundSize: '100% 4px',
        }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.02) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-white/20 p-4 md:p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 animate-pulse" />
                <span className="text-xs text-green-500 uppercase tracking-widest">SYSTEM_ONLINE</span>
              </div>
              <div className="hidden md:block text-xs text-gray-500">
                [{terminalText}]
              </div>
            </div>
            <div className="text-xs text-gray-500 tabular-nums">
              {formatTime(currentTime)}
            </div>
          </div>
        </header>

        <div className="flex-1 flex">
          {/* Left Panel - System Info */}
          <div className="hidden lg:flex lg:w-1/2 border-r border-white/20">
            <div className="flex-1 p-8 lg:p-16 flex flex-col justify-between">
              {/* Logo and title */}
              <div>
                <div className="mb-12">
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tighter leading-none">
                    TESTRIDE.IO
                  </h1>
                  <div className="mt-2 text-xs text-gray-500 uppercase tracking-widest">
                    AUTOMOTIVE_INTELLIGENCE_PLATFORM
                  </div>
                </div>

                {/* ASCII Art Car */}
                <div className="my-12 text-xs text-green-500 leading-none whitespace-pre font-mono">
{`    ____
 __/  |_\\_
|  _     _``-.
'-(_)---(_)--'`}
                </div>

                {/* System capabilities */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">&gt;</span>
                      <span className="text-xs uppercase tracking-wider">LEAD_RESPONSE_TIME</span>
                    </div>
                    <div className="pl-4 text-2xl font-bold">00:05:00</div>
                    <div className="pl-4 text-xs text-gray-500">GUARANTEED_MAXIMUM</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">&gt;</span>
                      <span className="text-xs uppercase tracking-wider">CONVERSION_DELTA</span>
                    </div>
                    <div className="pl-4 text-2xl font-bold">+67.3%</div>
                    <div className="pl-4 text-xs text-gray-500">AVERAGE_IMPROVEMENT</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">&gt;</span>
                      <span className="text-xs uppercase tracking-wider">MONTHLY_REVENUE_GAIN</span>
                    </div>
                    <div className="pl-4 text-2xl font-bold">$127,000</div>
                    <div className="pl-4 text-xs text-gray-500">PER_DEALERSHIP_AVERAGE</div>
                  </div>
                </div>
              </div>

              {/* System status */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-2 border-t border-white/20">
                  <span className="text-gray-500">NEURAL_NETWORK</span>
                  <span className="text-green-500">OPERATIONAL</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-white/20">
                  <span className="text-gray-500">API_STATUS</span>
                  <span className="text-green-500">CONNECTED</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-white/20">
                  <span className="text-gray-500">UPTIME</span>
                  <span className="text-green-500">99.99%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Login */}
          <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
            <div className="w-full max-w-md">
              {/* Mobile header */}
              <div className="lg:hidden mb-8">
                <h1 className="text-3xl font-bold tracking-tighter">TESTRIDE.IO</h1>
                <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                  SYSTEM_ACCESS
                </div>
              </div>

              <div className="space-y-8">
                {/* Terminal prompt */}
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 uppercase tracking-widest">
                    AUTHENTICATION_REQUIRED
                  </div>
                  <div className="text-xs text-green-500">
                    &gt; ENTER_CREDENTIALS_TO_PROCEED_
                  </div>
                </div>

                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs uppercase tracking-widest text-gray-500">
                      EMAIL_ADDRESS
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">
                        &gt;
                      </span>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@automax.com"
                        required
                        className="w-full h-12 pl-8 pr-4 bg-black border border-white/20 text-white placeholder:text-gray-600 focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-xs uppercase tracking-widest text-gray-500">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">
                        &gt;
                      </span>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full h-12 pl-8 pr-4 bg-black border border-white/20 text-white placeholder:text-gray-600 focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-green-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-pulse">AUTHENTICATING...</span>
                        </span>
                      ) : (
                        'EXECUTE_LOGIN_SEQUENCE'
                      )}
                    </span>
                    <div className="absolute inset-0 bg-green-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  </button>
                </form>

                {/* Demo credentials */}
                <div className="space-y-2 pt-4 border-t border-white/20">
                  <div className="text-xs text-gray-500 uppercase tracking-widest">
                    DEMO_ACCESS_CREDENTIALS
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    <div>&gt; EMAIL: john@automax.com</div>
                    <div>&gt; PASS: password</div>
                  </div>
                </div>

                {/* System messages */}
                <div className="space-y-1 text-xs text-gray-600">
                  <div>[SYSTEM] Connection secured via TLS 1.3</div>
                  <div>[SYSTEM] Location: Stockholm, SE</div>
                  <div>[SYSTEM] Session timeout: 30:00</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/20 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>© 2025 TESTRIDE.IO</span>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:inline">BUILD_2.4.1</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>GDPR_COMPLIANT</span>
              <span>|</span>
              <span>SOC2_CERTIFIED</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Flicker effect */}
      <style jsx>{`
        @keyframes flicker {
          0% { opacity: 0.98; }
          5% { opacity: 0.95; }
          10% { opacity: 0.98; }
          15% { opacity: 0.96; }
          20% { opacity: 0.98; }
          25% { opacity: 0.95; }
          30% { opacity: 0.98; }
          35% { opacity: 0.97; }
          40% { opacity: 0.98; }
          45% { opacity: 0.96; }
          50% { opacity: 0.98; }
          100% { opacity: 0.98; }
        }
        
        body {
          animation: flicker 10s infinite;
        }
      `}</style>
    </div>
  );
}