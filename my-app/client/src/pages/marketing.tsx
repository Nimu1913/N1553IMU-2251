import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  Eye, 
  MousePointer, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Mail,
  MessageSquare,
  Plus
} from "lucide-react";

export default function Marketing() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const campaigns = [
    {
      id: "1",
      name: "Spring Sale 2025",
      status: "active",
      budget: 5000,
      spent: 3200,
      leads: 45,
      conversions: 8,
      roi: 240,
    },
    {
      id: "2", 
      name: "SUV Promotion",
      status: "paused",
      budget: 3000,
      spent: 1800,
      leads: 23,
      conversions: 4,
      roi: 180,
    },
    {
      id: "3",
      name: "Weekend Special",
      status: "completed",
      budget: 2000,
      spent: 2000,
      leads: 67,
      conversions: 12,
      roi: 320,
    }
  ];

  const analytics = {
    totalLeads: 438,
    conversionRate: 8.7,
    avgLeadCost: 42,
    totalRevenue: 890000,
    customerLifetimeValue: 65000,
    returnCustomers: 23
  };

  const inventoryAnalytics = [
    { model: "BMW 3 Series", views: 234, leads: 18, inquiries: 12, avgDaysToSell: 24 },
    { model: "Audi A4", views: 187, leads: 15, inquiries: 9, avgDaysToSell: 31 },
    { model: "Mercedes C-Class", views: 156, leads: 12, inquiries: 8, avgDaysToSell: 28 },
    { model: "Volvo XC90", views: 143, leads: 11, inquiries: 7, avgDaysToSell: 35 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto bg-secondary/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Marketing & Analytics</h1>
              <p className="text-muted-foreground">Track campaigns, analyze performance, and optimize your marketing strategy</p>
            </div>
            <Button data-testid="button-create-campaign">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns" data-testid="tab-campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="inventory" data-testid="tab-inventory">Inventory Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="metric-total-leads">{analytics.totalLeads}</p>
                        <p className="text-xs text-green-600 mt-1">↗ +12% from last month</p>
                      </div>
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="metric-conversion-rate">{analytics.conversionRate}%</p>
                        <p className="text-xs text-green-600 mt-1">↗ +2.3% from last month</p>
                      </div>
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Cost Per Lead</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="metric-cost-per-lead">{analytics.avgLeadCost} SEK</p>
                        <p className="text-xs text-red-600 mt-1">↗ +5 SEK from last month</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="metric-revenue">{(analytics.totalRevenue / 1000).toFixed(0)}K SEK</p>
                        <p className="text-xs text-green-600 mt-1">↗ +18% from last month</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Campaign Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Active Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.filter(c => c.status === 'active').map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`campaign-${campaign.id}`}>
                        <div>
                          <h3 className="font-medium">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground">{campaign.leads} leads • ROI: {campaign.roi}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{campaign.spent} / {campaign.budget} SEK</p>
                          <Progress value={(campaign.spent / campaign.budget) * 100} className="w-24 h-2 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`campaign-detail-${campaign.id}`}>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium">{campaign.name}</h3>
                            <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                          </div>
                          <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Budget</p>
                              <p className="font-medium">{campaign.budget} SEK</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Spent</p>
                              <p className="font-medium">{campaign.spent} SEK</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Leads</p>
                              <p className="font-medium">{campaign.leads}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">ROI</p>
                              <p className="font-medium text-green-600">{campaign.roi}%</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" data-testid={`edit-campaign-${campaign.id}`}>Edit</Button>
                          <Button variant="outline" size="sm" data-testid={`view-campaign-${campaign.id}`}>View</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Customer Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Customer Lifetime Value</span>
                      <span className="text-lg font-bold" data-testid="clv-value">{(analytics.customerLifetimeValue / 1000).toFixed(0)}K SEK</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Return Customers</span>
                      <span className="text-lg font-bold" data-testid="return-customers">{analytics.returnCustomers}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg Deal Size</span>
                      <span className="text-lg font-bold" data-testid="avg-deal-size">{(analytics.totalRevenue / analytics.totalLeads * analytics.conversionRate / 100 / 1000).toFixed(0)}K SEK</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="w-5 h-5 mr-2" />
                      Lead Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Blocket</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={45} className="w-20 h-2" />
                          <span className="text-sm font-medium">45%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Direct Website</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={30} className="w-20 h-2" />
                          <span className="text-sm font-medium">30%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Social Media</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={15} className="w-20 h-2" />
                          <span className="text-sm font-medium">15%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Referrals</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={10} className="w-20 h-2" />
                          <span className="text-sm font-medium">10%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inventoryAnalytics.map((vehicle, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`vehicle-analytics-${index}`}>
                        <div className="flex-1">
                          <h3 className="font-medium">{vehicle.model}</h3>
                          <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Views</p>
                              <p className="font-medium flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                {vehicle.views}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Leads</p>
                              <p className="font-medium flex items-center">
                                <MousePointer className="w-4 h-4 mr-1" />
                                {vehicle.leads}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Inquiries</p>
                              <p className="font-medium flex items-center">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                {vehicle.inquiries}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Avg Days to Sell</p>
                              <p className="font-medium flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {vehicle.avgDaysToSell}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Conversion Rate</p>
                          <p className="text-lg font-bold text-green-600">{((vehicle.inquiries / vehicle.views) * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}