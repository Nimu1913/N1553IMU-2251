import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Car,
  Sparkles,
  Package,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Settings,
  HelpCircle,
  ChevronRight,
  BarChart3,
  Handshake,
  LogOut
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Appointments", href: "/appointments", icon: Calendar, badge: "3" },
    { name: "Leads", href: "/leads", icon: Users, badge: "7" },
    { name: "Vehicles", href: "/vehicles", icon: Car },
    { name: "AI Studio", href: "/ai-studio", icon: Sparkles },
    { name: "Blocket", href: "/blocket", icon: Package },
    { name: "Marketing", href: "/marketing", icon: TrendingUp },
    { name: "Communications", href: "/communications", icon: MessageSquare },
    { name: "Deals", href: "/deals", icon: Handshake },
  ];

  const secondaryNavigation = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Support", href: "/support", icon: HelpCircle },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  return (
    <div
      className={cn(
        "sidebar-transition fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-sm md:relative md:translate-x-0",
        !open && "md:block sidebar-hidden md:sidebar-hidden"
      )}
      data-testid="sidebar"
    >
      {/* Logo Section */}
      <div className="flex items-center px-6 py-5 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">TestDriveNow</h1>
            <p className="text-xs text-gray-500">Sales Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <button
              key={item.name}
              onClick={() => setLocation(item.href)}
              className={cn(
                "group flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 relative",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-3">
                {/* Animated icon */}
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                    isActive && "text-blue-600"
                  )} 
                />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              
              {/* Badge with animation */}
              {item.badge && (
                <span 
                  className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full -ml-4 transition-all duration-300" />
              )}
            </button>
          );
        })}

        {/* Secondary Navigation */}
        <div className="pt-4 mt-4 border-t border-gray-100 space-y-1">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className={cn(
                  "group flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110" />
                <span className="font-medium text-sm">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center space-x-3 group">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <span className="text-white text-sm font-medium">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate" data-testid="text-username">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate" data-testid="text-dealership">
              {user?.dealership || 'Dealership'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
            data-testid="button-logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}