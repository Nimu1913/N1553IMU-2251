// my-app/client/src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: string;
  vehicle_interest: string;
  message: string;
  created_at: string;
  responded_at: string | null;
  response_time_seconds: number | null;
}

interface Appointment {
  id: string;
  lead_id: string;
  appointment_date: string;
  appointment_type: string;
  status: string;
  notes: string;
  created_at: string;
  leads?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch appointments
      const appointmentsResponse = await fetch('/api/appointments');
      const appointmentsResult = await appointmentsResponse.json();
      
      // IMPORTANT: Access the data property and ensure it's an array
      if (appointmentsResult.success) {
        setAppointments(appointmentsResult.data || []);
      } else {
        console.error('Failed to fetch appointments:', appointmentsResult.error);
        setAppointments([]);
      }

      // Fetch leads
      const leadsResponse = await fetch('/api/leads');
      const leadsResult = await leadsResponse.json();
      
      // IMPORTANT: Access the data property and ensure it's an array
      if (leadsResult.success) {
        setLeads(leadsResult.data || []);
      } else {
        console.error('Failed to fetch leads:', leadsResult.error);
        setLeads([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data",
      });
      // Set empty arrays on error to prevent crashes
      setAppointments([]);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.appointment_date) > new Date() && apt.status === 'scheduled')
    .slice(0, 5); // Safe to use slice now

  const recentLeads = leads
    .slice(0, 5); // Safe to use slice now

  const hotLeads = leads
    .filter(lead => lead.response_time_seconds && lead.response_time_seconds < 300)
    .length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'User'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingAppointments.length} upcoming this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
              <p className="text-xs text-muted-foreground">
                {hotLeads} responded within 5 min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leads.length > 0
                  ? Math.round(
                      leads
                        .filter(l => l.response_time_seconds)
                        .reduce((acc, l) => acc + (l.response_time_seconds || 0), 0) /
                        leads.filter(l => l.response_time_seconds).length
                    )
                  : 0}{" "}
                sec
              </div>
              <p className="text-xs text-muted-foreground">Target: under 5 minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leads.length > 0
                  ? Math.round((appointments.length / leads.length) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                {appointments.length} appointments from {leads.length} leads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your next scheduled test drives</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <p className="text-muted-foreground">No upcoming appointments</p>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {apt.leads?.first_name} {apt.leads?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(apt.appointment_date).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {apt.appointment_type.replace('_', ' ')}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Latest inquiries to follow up</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <p className="text-muted-foreground">No recent leads</p>
              ) : (
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {lead.first_name} {lead.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{lead.vehicle_interest}</p>
                        <p className="text-xs text-muted-foreground">
                          {lead.source} • {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Contact
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}