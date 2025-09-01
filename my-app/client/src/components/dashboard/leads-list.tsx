import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export function LeadsList() {
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["/api/leads"],
  });

  const recentLeads = leads.slice(0, 3);

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case "hot":
        return "bg-red-100 text-red-800";
      case "warm":
        return "bg-yellow-100 text-yellow-800";
      case "new":
        return "bg-blue-100 text-blue-800";
      case "cold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getInitialsColor = (name: string) => {
    const colors = [
      "bg-green-100 text-green-600",
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600",
      "bg-orange-100 text-orange-600",
    ];
    return colors[name.length % colors.length];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
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
    <Card data-testid="leads-list">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Leads</CardTitle>
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentLeads.length > 0 ? (
            recentLeads.map((lead: any) => (
              <div 
                key={lead.id}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                data-testid={`lead-${lead.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getInitialsColor(lead.customerName)}`}>
                    <span className="text-sm font-medium" data-testid={`lead-initials-${lead.id}`}>
                      {getInitials(lead.customerName)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground" data-testid={`lead-name-${lead.id}`}>
                      {lead.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`lead-source-${lead.id}`}>
                      {lead.leadSource}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLeadStatusColor(lead.leadStatus)}`}>
                    {lead.leadStatus.charAt(0).toUpperCase() + lead.leadStatus.slice(1)}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8" data-testid="no-leads">
              No leads yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
