import { Button } from "@/components/ui/button";
import { Menu, Plus, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
      <div className="flex justify-between items-center">
        {/* Left side - Menu and Title */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
            data-testid="mobile-menu-toggle"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* Desktop title */}
          <h2 className="hidden md:block text-xl md:text-2xl font-semibold text-gray-900">
            Welcome back!
          </h2>
          
          {/* Mobile logo */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">TestRide.io</span>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Search - Desktop always visible, Mobile toggleable */}
          <div className={cn(
            "hidden md:flex items-center",
            searchVisible && "!flex absolute left-4 right-4 md:relative md:left-0 md:right-0"
          )}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                type="search"
                placeholder="Search..."
                className="pl-9 pr-4 w-full md:w-64 bg-gray-50"
              />
            </div>
            {searchVisible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchVisible(false)}
                className="md:hidden ml-2"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchVisible(!searchVisible)}
            className="md:hidden"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* Quick Book - Text on desktop, Icon on mobile */}
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Quick Book</span>
          </Button>
        </div>
      </div>

      {/* Mobile search bar when visible */}
      {searchVisible && (
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              type="search"
              placeholder="Search..."
              className="pl-9 pr-4 w-full bg-gray-50"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}

// Helper function (add this to your utils if not already present)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}