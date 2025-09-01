import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu, Plus, Bell } from "lucide-react";
import { QuickBookingModal } from "@/components/forms/quick-booking-modal";
import { useState } from "react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useAuth();
  const [showQuickBooking, setShowQuickBooking] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-border px-6 py-4" data-testid="header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="md:hidden"
              data-testid="button-toggle-sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Welcome back, <span data-testid="text-user-firstname">{user?.name?.split(' ')[0] || 'User'}</span>!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowQuickBooking(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-quick-book"
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick Book
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full pulse-animation"></span>
            </Button>
          </div>
        </div>
      </header>

      <QuickBookingModal 
        open={showQuickBooking} 
        onOpenChange={setShowQuickBooking} 
      />
    </>
  );
}
