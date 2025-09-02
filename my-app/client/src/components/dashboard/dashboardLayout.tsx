// my-app/client/src/components/dashboard/dashboardLayout.tsx
import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h2>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Quick Book
          </Button>
        </header>

        {/* Page Content with Animation */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}