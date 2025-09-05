import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useLanguage } from "@/contexts/language-context";
import { useMetrics } from "@/contexts/metrics-context";
import { useAccount } from "@/contexts/account-context";
import { useLocation } from "wouter";
import { Menu, X, Activity, Users, Calendar, DollarSign, Car, MessageSquare, Settings, BarChart3, Brain, Zap, TrendingUp, Phone, MapPin, FileText, Maximize2 } from "lucide-react";
import SalesAnalytics3D from "@/components/3d/SalesAnalytics3D";
import ManagerOverview from "@/components/manager/ManagerOverview";
import AccountSelector from "@/components/account/AccountSelector";

export default function SimpleDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { metrics, formatCurrency } = useMetrics();
  const { currentAccount, isManagerView } = useAccount();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cpuUsage, setCpuUsage] = useState(12);
  const userName = user?.name?.toUpperCase().replace(' ', '_') || 'JOHN_SMITH';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setCpuUsage(Math.floor(Math.random() * 30) + 10);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const navigationItems = [
    { name: t('nav.dashboard'), icon: BarChart3, href: "/dashboard", count: null },
    { name: t('nav.appointments'), icon: Calendar, href: "/appointments", count: 8 },
    { name: t('nav.leads'), icon: Users, href: "/leads", count: 23 },
    { name: t('nav.vehicles'), icon: Car, href: "/vehicles", count: null },
    { name: t('nav.aiStudio'), icon: Brain, href: "/ai-studio", count: null },
    { name: t('nav.blocket'), icon: MapPin, href: "/blocket", count: 12 },
    { name: t('nav.marketing'), icon: TrendingUp, href: "/marketing", count: null },
    { name: t('nav.communications'), icon: MessageSquare, href: "/communications", count: 3 },
    { name: t('nav.deals'), icon: DollarSign, href: "/deals", count: 5 },
    { name: t('nav.settings'), icon: Settings, href: "/settings", count: null },
    { name: t('nav.support'), icon: Phone, href: "/support", count: null },
  ];

  const handleNavigation = (href: string) => {
    setLocation(href);
  };

  // Map metrics to dashboard stats with icons and colors
  const getMetricIcon = (id: string) => {
    const iconMap: { [key: string]: any } = {
      'totalSales': DollarSign,
      'activeLeads': Users,
      'appointments': Calendar,
      'vehiclesInStock': Car,
      'conversionRate': TrendingUp,
      'avgDealValue': DollarSign
    };
    return iconMap[id] || Activity;
  };

  const getMetricColor = (id: string) => {
    const colorMap: { [key: string]: string } = {
      'totalSales': 'from-green-500 to-emerald-600',
      'activeLeads': 'from-blue-500 to-cyan-600',
      'appointments': 'from-purple-500 to-indigo-600',
      'vehiclesInStock': 'from-orange-500 to-yellow-600',
      'conversionRate': 'from-pink-500 to-rose-600',
      'avgDealValue': 'from-indigo-500 to-blue-600'
    };
    return colorMap[id] || 'from-gray-500 to-slate-600';
  };

  const stats = metrics
    .filter(metric => metric.visible)
    .sort((a, b) => a.order - b.order)
    .slice(0, 4) // Show only first 4 metrics on dashboard
    .map(metric => ({
      label: metric.name,
      value: metric.type === 'currency' 
        ? formatCurrency(Number(metric.value))
        : metric.type === 'percentage'
        ? `${metric.value}${metric.unit}`
        : `${metric.value}${metric.unit ? ` ${metric.unit}` : ''}`,
      change: "+5.2%", // This could be calculated from historical data
      trend: "up" as const,
      icon: getMetricIcon(metric.id),
      color: getMetricColor(metric.id)
    }));

  const recentActivity = [
    { time: "2 min ago", type: "LEAD", message: "New lead from website contact form", data: "Sofia Andersson", color: "bg-blue-500" },
    { time: "5 min ago", type: "APPOINTMENT", message: "Test drive scheduled", data: "BMW X3 - Tomorrow 2:00 PM", color: "bg-green-500" },
    { time: "8 min ago", type: "DEAL", message: "Deal moved to closing stage", data: "Audi A4 - $45,000", color: "bg-yellow-500" },
    { time: "12 min ago", type: "MESSAGE", message: "SMS campaign sent", data: "248 recipients", color: "bg-purple-500" },
    { time: "18 min ago", type: "SYSTEM", message: "Blocket ads synchronized", data: "12 listings updated", color: "bg-gray-500" },
  ];

  return (
    <div className="min-h-screen text-white relative">
      {/* Fixed Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 -z-10"></div>
      
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="flex relative z-10">
        {/* Modern Glassmorphism Sidebar */}
        <aside className={`backdrop-blur-xl bg-white/10 border-r border-white/20 shadow-2xl transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}>
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Menu size={24} className="text-white" />
              </button>
              {sidebarOpen && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Car size={18} className="text-white" />
                  </div>
                  <span className="font-bold text-xl text-white">
                    TESTRIDE.IO
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <nav className="mt-8 px-2 space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent size={20} />
                    {sidebarOpen && <span className="font-medium">{item.name}</span>}
                  </div>
                  {sidebarOpen && item.count && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isActive ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Modern Glassmorphism Header */}
          <header className="backdrop-blur-xl bg-white/10 border-b border-white/20 p-6 relative z-50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
                <p className="text-white/70">{t('dashboard.subtitle')}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-white/60">
                  {formatTime(currentTime)}
                </div>
                
                {/* Account Selector */}
                <AccountSelector />
                
                <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user?.name?.charAt(0) || 'J'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {isManagerView && currentAccount?.type === 'mother' ? (
              <ManagerOverview />
            ) : (
              <React.Fragment>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 lg:p-6 shadow-2xl hover:bg-white/15 transition-all">
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <div className={`p-2 lg:p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                        <IconComponent size={20} className="text-white lg:w-6 lg:h-6" />
                      </div>
                      <div className={`flex items-center space-x-1 text-xs lg:text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        <TrendingUp size={14} className={`lg:w-4 lg:h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                        <span>{stat.change}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl lg:text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-white/70 text-xs lg:text-sm">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Activity Feed */}
              <div className="lg:col-span-2">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                    <Activity size={20} className="text-white/60" />
                  </div>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-3 hover:bg-white/10 rounded-lg transition-colors">
                        <div className={`w-3 h-3 rounded-full mt-2 ${activity.color}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{activity.message}</p>
                          <p className="text-sm text-white/60">{activity.data}</p>
                        </div>
                        <div className="text-xs text-white/40 whitespace-nowrap">
                          {activity.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats & User Info */}
              <div className="space-y-6">
                {/* 3D Sales Analytics */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">3D Sales Analytics</h3>
                    <Maximize2 size={20} className="text-blue-400" />
                  </div>
                  <SalesAnalytics3D className="h-[400px] w-full" />
                </div>

                {/* User Info Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4">Account Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Users size={16} />
                      <span className="text-sm">{user?.dealership}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FileText size={16} />
                      <span className="text-sm capitalize">{user?.role}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Activity size={16} />
                      <span className="text-sm">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </React.Fragment>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}