import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Handshake, ArrowLeftRight, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export function AppointmentsList() {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/appointments"],
  });

  // Filter today's appointments
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter((apt: any) => 
    format(new Date(apt.scheduledDate), 'yyyy-MM-dd') === today
  ).slice(0, 3);

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case "test_drive":
        return Car;
      case "sales_meeting":
        return Handshake;
      case "trade_in":
        return ArrowLeftRight;
      default:
        return Car;
    }
  };

  const getAppointmentColor = (type: string) => {
    switch (type) {
      case "test_drive":
        return "bg-primary text-primary-foreground";
      case "sales_meeting":
        return "bg-orange-500 text-white";
      case "trade_in":
        return "bg-purple-500 text-white";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="appointments-list">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today's Schedule</CardTitle>
          <Button variant="link" className="text-primary hover:text-primary/80">
            View Calendar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todayAppointments.length > 0 ? (
            todayAppointments.map((appointment: any) => {
              const Icon = getAppointmentIcon(appointment.appointmentType);
              return (
                <div 
                  key={appointment.id} 
                  className="flex items-center p-4 bg-secondary/50 rounded-lg border border-border"
                  data-testid={`appointment-${appointment.id}`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${getAppointmentColor(appointment.appointmentType)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground" data-testid={`appointment-customer-${appointment.id}`}>
                        {appointment.customerName}
                      </h4>
                      <span className="text-sm text-muted-foreground" data-testid={`appointment-time-${appointment.id}`}>
                        {format(new Date(appointment.scheduledDate), 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid={`appointment-info-${appointment.id}`}>
                      {appointment.appointmentType.replace('_', ' ').toUpperCase()} - {appointment.vehicleInfo || 'No vehicle specified'}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      <Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                      <Button variant="link" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground text-center py-8" data-testid="no-appointments">
              No appointments scheduled for today
            </p>
          )}
          
          <Button variant="link" className="w-full text-center text-primary hover:text-primary/80 font-medium">
            View All Appointments →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
