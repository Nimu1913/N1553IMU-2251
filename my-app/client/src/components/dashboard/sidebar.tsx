import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { X, Menu } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const navigation = [
    { name: "DASHBOARD", href: "/dashboard", id: "01" },
    { name: "APPOINTMENTS", href: "/appointments", id: "02", count: "003" },
    { name: "LEADS", href: "/leads", id: "03", count: "007" },
    { name: "VEHICLES", href: "/vehicles", id: "04" },
    { name: "AI_STUDIO", href: "/ai-studio", id: "05" },
    { name: "BLOCKET", href: "/blocket", id: "06" },
    { name: "MARKETING", href: "/marketing", id: "07" },
    { name: "COMMUNICATIONS", href: "/communications", id: "08" },
    { name: "DEALS", href: "/deals", id: "09" },
  ];

  const systemNavigation = [
    { name: "SETTINGS", href: "/settings", id: "10" },
    { name: "SUPPORT", href: "/support", id: "11" },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const handleNavigation = (href: string) => {
    setLocation(href);
    if (window.innerWidth < 768) {
      onOpenChange(false);
    }
  };

  const SidebarContent = () => (
    <div className="h-full bg-black text-white font-mono flex flex-col">
      {/* Header */}
      <div className="border-b border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tighter">TESTRIDE.IO</h1>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
              SYSTEM_CONTROL_PANEL
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="md:hidden p-2 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Status */}
      <div className="border-b border-white/20 p-4 text-xs">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">USER:</span>
            <span className="text-green-500 uppercase">{user?.name || 'JOHN_SMITH'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">ACCESS:</span>
            <span className="text-green-500">LEVEL_5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">STATUS:</span>
            <span className="text-green-500 animate-pulse">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">
            PRIMARY_MODULES
          </div>
        </div>
        
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                "w-full text-left px-4 py-2 text-xs transition-all duration-200 flex items-center justify-between group",
                isActive
                  ? "bg-white text-black"
                  : "hover:bg-white/10 text-gray-300 hover:text-white"
              )}
            >
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">[{item.id}]</span>
                <span className="uppercase tracking-wider font-semibold">{item.name}</span>
              </div>
              {item.count && (
                <span className={cn(
                  "tabular-nums",
                  isActive ? "text-black" : "text-green-500"
                )}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        <div className="px-4 mb-2 mt-6">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">
            SYSTEM_FUNCTIONS
          </div>
        </div>

        {systemNavigation.map((item) => {
          const isActive = location === item.href;
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                "w-full text-left px-4 py-2 text-xs transition-all duration-200 flex items-center space-x-3 group",
                isActive
                  ? "bg-white text-black"
                  : "hover:bg-white/10 text-gray-300 hover:text-white"
              )}
            >
              <span className="text-gray-500">[{item.id}]</span>
              <span className="uppercase tracking-wider font-semibold">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* System Info */}
      <div className="border-t border-white/20 p-4 space-y-3">
        <div className="text-[10px] space-y-1 text-gray-500">
          <div>MEM: 2.4GB / 8.0GB</div>
          <div>CPU: 12% USAGE</div>
          <div>NET: 156ms LATENCY</div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/50 text-red-500 text-xs uppercase tracking-widest font-semibold transition-all duration-200"
        >
          TERMINATE_SESSION
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:block md:w-64 border-r border-white/20 bg-black transition-all duration-300",
        !open && "md:w-0 md:overflow-hidden"
      )}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-80 md:hidden border-r border-white/20">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}