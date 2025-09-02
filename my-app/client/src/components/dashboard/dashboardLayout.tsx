// my-app/client/src/components/DashboardLayout.tsx
import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Car,
  Calendar,
  Users,
  CarFront,
  Sparkles,
  FolderKanban,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Settings,
  HelpCircle,
  Plus,
  LogOut,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
    { name: "Appointments", href: "/appointments", icon: Calendar, badge: "3" },
    { name: "Leads", href: "/leads", icon: Users, badge: "7" },
    { name: "Vehicles", href: "/vehicles", icon: CarFront },
    { name: "AI Studio", href: "/ai-studio", icon: Sparkles },
    { name: "Blocket", href: "/blocket", icon: FolderKanban },
    { name: "Marketing", href: "/marketing", icon: TrendingUp },
    { name: "Communications", href: "/communications", icon: MessageSquare },
    { name: "Deals", href: "/deals", icon: DollarSign },
  ];

  const bottomNav = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Support", href: "/support", icon: HelpCircle },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">TestDriveNow</h1>
              <p className="text-xs text-gray-500">Sales Dashboard</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setLocation(item.href);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 p-4">
          <ul className="space-y-1">
            {bottomNav.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setLocation(item.href);
                    }}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || "J"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || "John Smith"}
                </p>
                <p className="text-xs text-gray-500">AutoMax Dealership</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-gray-400 hover:text-gray-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Quick Book
          </Button>
        </div>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}