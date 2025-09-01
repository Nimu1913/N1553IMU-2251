import { Card } from "@/components/ui/card";
import { Calendar, Users, TrendingUp, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export function StatsCards() {
  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads"],
  });

  // Calculate stats
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = appointments.filter((apt: any) => 
    format(new Date(apt.scheduledDate), 'yyyy-MM-dd') === today
  );

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekLeads = leads.filter((lead: any) => 
    new Date(lead.createdAt) >= weekStart
  );

  const hotLeads = leads.filter((lead: any) => lead.leadStatus === 'hot');
  const conversionRate = leads.length > 0 ? ((hotLeads.length / leads.length) * 100).toFixed(1) : '0';

  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.length,
      change: "+2 from yesterday",
      icon: Calendar,
      color: "blue",
      positive: true,
    },
    {
      title: "Active Leads",
      value: leads.length,
      change: `+${weekLeads.length} this week`,
      icon: Users,
      color: "orange",
      positive: true,
    },
    {
      title: "Month Sales",
      value: "$127k",
      change: "+12% from last month",
      icon: DollarSign,
      color: "green",
      positive: true,
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      change: "-1.2% from last week",
      icon: TrendingUp,
      color: "purple",
      positive: false,
    },
  ];

  const colorClasses = {
    blue: "bg-blue-100 text-blue-500",
    orange: "bg-orange-100 text-orange-500",
    green: "bg-green-100 text-green-500",
    purple: "bg-purple-100 text-purple-500",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-cards">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="stat-card p-6 card-hover" data-testid={`stat-card-${index}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </p>
                <p className={`text-xs mt-1 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="inline-flex items-center">
                    <i className={`fas fa-arrow-${stat.positive ? 'up' : 'down'} mr-1`}></i>
                    {stat.change}
                  </span>
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <Icon className="text-lg" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
