import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cpuUsage, setCpuUsage] = useState(12);
  const userName = user?.name || 'JOHN_SMITH';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setCpuUsage(Math.floor(Math.random() * 30) + 10);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: "APPOINTMENTS_TODAY", value: "000", delta: "+002", status: "NOMINAL" },
    { label: "ACTIVE_LEADS", value: "009", delta: "+009", status: "ELEVATED" },
    { label: "MONTHLY_REVENUE", value: "$127K", delta: "+12%", status: "OPTIMAL" },
    { label: "CONVERSION_RATE", value: "22%", delta: "-1.2%", status: "WARNING" },
  ];

  const recentActivity = [
    { time: "14:32:01", type: "LEAD", message: "NEW_LEAD_CAPTURED", data: "SOFIE_JONSSON" },
    { time: "14:28:45", type: "APPT", message: "APPOINTMENT_SCHEDULED", data: "2024-01-15_10:00" },
    { time: "14:15:22", type: "DEAL", message: "DEAL_STAGE_UPDATED", data: "NEGOTIATION→CLOSING" },
    { time: "13:55:10", type: "COMM", message: "SMS_CAMPAIGN_SENT", data: "248_RECIPIENTS" },
    { time: "13:42:33", type: "SYS", message: "BACKUP_COMPLETED", data: "SUCCESS" },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPTIMAL': return 'text-green-500';
      case 'ELEVATED': return 'text-blue-500';
      case 'WARNING': return 'text-yellow-500';
      case 'CRITICAL': return 'text-red-500';
      default: return 'text-gray-500';
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
    <div className="min-h-screen bg-black text-white font-mono flex">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-white/10 transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-gray-500">
                  DASHBOARD_INTERFACE
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <span className="hidden md:inline">CPU: {cpuUsage}%</span>
              <span className="hidden md:inline">|</span>
              <span className="tabular-nums">{formatTime(currentTime)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {/* Welcome Section */}
          <div className="border-b border-white/20 p-6">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">
              SESSION_AUTHENTICATED
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">
              WELCOME_BACK_{userName.toUpperCase().replace(' ', '_')}
            </h1>
            <div className="text-xs text-green-500 mt-2">
              &gt; SYSTEM_READY_FOR_OPERATION_
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">
                PERFORMANCE_METRICS
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="border border-white/20 p-4 hover:border-green-500/50 transition-colors">
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                      {stat.label}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold mb-2 tabular-nums">
                      {stat.value}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{stat.delta}</span>
                      <span className={getStatusColor(stat.status)}>[{stat.status}]</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">
                  SYSTEM_ACTIVITY_LOG
                </div>
                <div className="border border-white/20 overflow-hidden">
                  <div className="bg-white/5 p-2 border-b border-white/20">
                    <div className="text-xs text-gray-400">
                      MONITORING_REALTIME_EVENTS
                    </div>
                  </div>
                  <div className="divide-y divide-white/10">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="p-3 hover:bg-white/5 transition-colors text-xs">
                        <div className="flex items-start space-x-3">
                          <span className="text-gray-500 tabular-nums">{activity.time}</span>
                          <span className="text-green-500">[{activity.type}]</span>
                          <div className="flex-1">
                            <div className="text-gray-300">{activity.message}</div>
                            <div className="text-gray-500 mt-1">&gt; {activity.data}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">
                  COMMAND_INTERFACE
                </div>
                <div className="space-y-3">
                  <button className="w-full p-4 border border-white/20 hover:border-green-500 hover:bg-white/5 transition-all text-left group">
                    <div className="text-xs text-gray-500 mb-1">[F1]</div>
                    <div className="text-sm font-semibold uppercase tracking-wider group-hover:text-green-500">
                      SCHEDULE_TEST_DRIVE
                    </div>
                  </button>
                  
                  <button className="w-full p-4 border border-white/20 hover:border-green-500 hover:bg-white/5 transition-all text-left group">
                    <div className="text-xs text-gray-500 mb-1">[F2]</div>
                    <div className="text-sm font-semibold uppercase tracking-wider group-hover:text-green-500">
                      ADD_NEW_LEAD
                    </div>
                  </button>
                  
                  <button className="w-full p-4 border border-white/20 hover:border-green-500 hover:bg-white/5 transition-all text-left group">
                    <div className="text-xs text-gray-500 mb-1">[F3]</div>
                    <div className="text-sm font-semibold uppercase tracking-wider group-hover:text-green-500">
                      GENERATE_QR_CODE
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">
                SYSTEM_DIAGNOSTICS
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-white/20 p-4">
                  <div className="text-xs text-gray-500 mb-2">LEAD_RESPONSE</div>
                  <div className="text-xl font-bold text-green-500 tabular-nums">87%</div>
                  <div className="text-xs text-gray-400 mt-1">EFFICIENCY</div>
                </div>
                <div className="border border-white/20 p-4">
                  <div className="text-xs text-gray-500 mb-2">CUSTOMER_RATING</div>
                  <div className="text-xl font-bold text-green-500 tabular-nums">4.8</div>
                  <div className="text-xs text-gray-400 mt-1">SCORE</div>
                </div>
                <div className="border border-white/20 p-4">
                  <div className="text-xs text-gray-500 mb-2">MONTHLY_UNITS</div>
                  <div className="text-xl font-bold text-green-500 tabular-nums">023</div>
                  <div className="text-xs text-gray-400 mt-1">VEHICLES</div>
                </div>
                <div className="border border-white/20 p-4">
                  <div className="text-xs text-gray-500 mb-2">UPTIME</div>
                  <div className="text-xl font-bold text-green-500 tabular-nums">99.9%</div>
                  <div className="text-xs text-gray-400 mt-1">RELIABILITY</div>
                </div>
              </div>
            </div>

            {/* Terminal Output */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">
                TERMINAL_OUTPUT
              </div>
              <div className="border border-white/20 bg-black p-4 font-mono text-xs text-gray-400">
                <div className="space-y-1">
                  <div className="text-green-500">&gt; SYSTEM_INITIALIZATION_COMPLETE</div>
                  <div>&gt; Loading user profile... [OK]</div>
                  <div>&gt; Connecting to database... [OK]</div>
                  <div>&gt; Synchronizing lead data... [OK]</div>
                  <div>&gt; Starting AI engine... [OK]</div>
                  <div className="text-green-500">&gt; ALL_SYSTEMS_OPERATIONAL</div>
                  <div className="animate-pulse">█</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/20 p-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>TESTRIDE.IO_V2.4.1</span>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:inline">BUILD_20250115</span>
            </div>
            <div>
              <span>SECURE_CONNECTION_ESTABLISHED</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Scanlines effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)',
          backgroundSize: '100% 4px',
        }} />
      </div>
    </div>
  );
}