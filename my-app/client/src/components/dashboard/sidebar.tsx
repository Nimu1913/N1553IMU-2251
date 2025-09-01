import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Car, 
  Calendar, 
  Users, 
  BarChart3, 
  Handshake, 
  Settings, 
  HelpCircle,
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
    { name: "Dashboard", href: "/dashboard", icon: BarChart3, active: location === "/dashboard" },
    { name: "Appointments", href: "/appointments", icon: Calendar, badge: "3" },
    { name: "Leads", href: "/leads", icon: Users, badge: "7" },
    { name: "Vehicles", href: "/vehicles", icon: Car, active: location === "/vehicles" },
    { name: "Deals", href: "/deals", icon: Handshake },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
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
        "sidebar-transition fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border shadow-lg md:relative md:translate-x-0",
        !open && "md:block sidebar-hidden md:sidebar-hidden"
      )}
      data-testid="sidebar"
    >
      {/* Logo Section */}
      <div className="flex items-center px-6 py-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">TestDriveNow</h1>
            <p className="text-xs text-muted-foreground">Sales Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => setLocation(item.href)}
              className={cn(
                "flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                item.active 
                  ? "text-primary bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              data-testid={`nav-${item.name.toLowerCase()}`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
              {item.badge && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-border">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate" data-testid="text-username">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-dealership">
              {user?.dealership || 'Dealership'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
