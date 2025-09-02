import { Sidebar } from "@/components/dashboard/sidebar";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function Leads() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto bg-secondary/30 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Leads Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lead management features coming soon...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
