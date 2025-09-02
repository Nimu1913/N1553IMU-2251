// my-app/client/src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/dashboard/dashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, DollarSign, TrendingUp, UserPlus, QrCode, CalendarPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  vehicle_interest: string;
  created_at: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_type: string;
  status: string;
  leads?: {
    first_name: string;
    last_name: string;
  };
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch appointments
      const appointmentsResponse = await fetch('/api/appointments');
      const appointmentsResult = await appointmentsResponse.json();
      if (appointmentsResult.success) {
        setAppointments(appointmentsResult.data || []);
      }

      // Fetch leads
      const leadsResponse = await fetch('/api/leads');
      const leadsResult = await leadsResponse.json();
      if (leadsResult.success) {
        setLeads(leadsResult.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  const monthSales = 127000; // Mock data for now
  const conversionRate = leads.length > 0 ? Math.round((appointments.length / leads.length) * 100) : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'John'}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Today's Appointments
                </CardTitle>
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs text-green-600 mt-1">+2 from yesterday</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Active Leads</CardTitle>
                <Users className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
              <p className="text-xs text-green-600 mt-1">+{leads.length} this week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Month Sales</CardTitle>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(monthSales / 1000).toFixed(0)}k</div>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-red-600 mt-1">-1.2% from last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule - 2 columns wide */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today's Schedule</CardTitle>
                <Button variant="link" className="text-blue-600">
                  View Calendar
                </Button>
              </CardHeader>
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No appointments scheduled for today
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {apt.leads?.first_name} {apt.leads?.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(apt.appointment_date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500 capitalize">
                          {apt.appointment_type.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-center">
                  <Button variant="link" className="text-blue-600">
                    View All Appointments →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - 1 column wide */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Schedule Test Drive
                </Button>
                <Button variant="outline" className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New Lead
                </Button>
                <Button variant="outline" className="w-full">
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </Button>
              </CardContent>
            </Card>

            {/* Recent Leads */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Leads</CardTitle>
                <Button variant="link" className="text-blue-600 text-sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {leads.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No leads yet</div>
                ) : (
                  <div className="space-y-3">
                    {leads.slice(0, 3).map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {lead.first_name} {lead.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{lead.vehicle_interest}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}