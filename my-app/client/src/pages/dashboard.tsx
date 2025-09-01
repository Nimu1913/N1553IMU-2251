import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AppointmentsList } from "@/components/dashboard/appointments-list";
import { LeadsList } from "@/components/dashboard/leads-list";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { useState } from "react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto bg-secondary/30 p-6">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <AppointmentsList />
            </div>
            
            <div className="space-y-6">
              <QuickActions />
              <LeadsList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
