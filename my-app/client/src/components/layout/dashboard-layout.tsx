import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "@/contexts/theme-context";
import { useAccount } from "@/contexts/account-context";
import { useLocation } from "wouter";
import { Menu, BarChart3, Calendar, Users, Car, Brain, MapPin, TrendingUp, MessageSquare, DollarSign, Settings, Phone, Moon, Sun } from "lucide-react";
import AccountSelector from "@/components/account/AccountSelector";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { currentAccount, isManagerView } = useAccount();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${
      isDarkMode ? 'text-white' : 'text-gray-900'
    }`}>
      {/* Fixed Background */}
      <div className={`fixed inset-0 -z-10 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900'
          : 'bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100'
      }`}></div>
      
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse transition-colors duration-300 ${
          isDarkMode ? 'bg-blue-500/10' : 'bg-blue-500/20'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 transition-colors duration-300 ${
          isDarkMode ? 'bg-purple-500/10' : 'bg-purple-500/20'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-500 transition-colors duration-300 ${
          isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-500/20'
        }`}></div>
      </div>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex relative z-10">
        {/* Modern Glassmorphism Sidebar */}
        <aside className={`backdrop-blur-xl shadow-2xl transition-all duration-300 z-50 ${
          isDarkMode 
            ? 'bg-white/10 border-r border-white/20' 
            : 'bg-white/70 border-r border-gray-200/50'
        } ${
          sidebarOpen 
            ? 'w-64 fixed lg:relative inset-y-0 left-0 lg:translate-x-0' 
            : 'w-16 fixed lg:relative inset-y-0 left-0 -translate-x-full lg:translate-x-0'
        }`}>
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-white/20' : 'hover:bg-gray-200/50'
                }`}
              >
                <Menu size={24} className={isDarkMode ? 'text-white' : 'text-gray-700'} />
              </button>
              {sidebarOpen && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Car size={18} className="text-white" />
                  </div>
                  <span className={`font-bold text-xl ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
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
        <main className="flex-1 lg:ml-0">
          {/* Modern Glassmorphism Header */}
          <header className="backdrop-blur-xl bg-white/10 border-b border-white/20 p-4 lg:p-6 relative z-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors lg:hidden"
                >
                  <Menu size={24} className="text-white" />
                </button>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-white">
                    {navigationItems.find(item => item.href === location)?.name || 'Dashboard'}
                  </h1>
                  <p className="text-white/70 text-sm lg:text-base hidden sm:block">Welcome back, {user?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? <Sun size={20} className="text-white" /> : <Moon size={20} className="text-white" />}
                </button>
                
                {/* Account Selector */}
                <AccountSelector />
                
                <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user?.name?.charAt(0) || 'J'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 lg:px-4 lg:py-2 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors text-xs lg:text-sm font-medium"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">↗</span>
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}