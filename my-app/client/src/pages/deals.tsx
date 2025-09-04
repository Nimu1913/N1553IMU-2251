import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Plus,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

export default function Deals() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const deals = [
    {
      id: "1",
      customer: "John Smith",
      vehicle: "BMW 330i",
      value: 45000,
      stage: "negotiation",
      probability: 75,
      lastActivity: "2 hours ago"
    },
    {
      id: "2",
      customer: "Sarah Johnson",
      vehicle: "Audi Q5",
      value: 52000,
      stage: "test-drive",
      probability: 40,
      lastActivity: "1 day ago"
    },
    {
      id: "3",
      customer: "Mike Wilson",
      vehicle: "Mercedes C300",
      value: 48000,
      stage: "closing",
      probability: 90,
      lastActivity: "30 minutes ago"
    },
    {
      id: "4",
      customer: "Emma Davis",
      vehicle: "Volvo XC60",
      value: 41000,
      stage: "qualified",
      probability: 25,
      lastActivity: "3 days ago"
    }
  ];

  const pipeline = {
    qualified: { count: 12, value: 480000 },
    testDrive: { count: 8, value: 380000 },
    negotiation: { count: 5, value: 240000 },
    closing: { count: 3, value: 145000 }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "qualified":
        return "bg-blue-100 text-blue-800";
      case "test-drive":
        return "bg-yellow-100 text-yellow-800";
      case "negotiation":
        return "bg-purple-100 text-purple-800";
      case "closing":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "qualified":
        return <Users className="w-4 h-4" />;
      case "test-drive":
        return <Calendar className="w-4 h-4" />;
      case "negotiation":
        return <AlertCircle className="w-4 h-4" />;
      case "closing":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
              <h1 className="text-2xl font-bold text-foreground">Deal Pipeline</h1>
              <p className="text-muted-foreground">Track and manage your sales opportunities</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Deal
              </Button>
            </div>
          </div>

          {/* Pipeline Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Qualified</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{pipeline.qualified.count}</p>
                <p className="text-sm text-muted-foreground">${(pipeline.qualified.value / 1000).toFixed(0)}k value</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Test Drive</span>
                  <Calendar className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold">{pipeline.testDrive.count}</p>
                <p className="text-sm text-muted-foreground">${(pipeline.testDrive.value / 1000).toFixed(0)}k value</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Negotiation</span>
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">{pipeline.negotiation.count}</p>
                <p className="text-sm text-muted-foreground">${(pipeline.negotiation.value / 1000).toFixed(0)}k value</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Closing</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{pipeline.closing.count}</p>
                <p className="text-sm text-muted-foreground">${(pipeline.closing.value / 1000).toFixed(0)}k value</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">Active Deals</TabsTrigger>
              <TabsTrigger value="won">Won</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deals.map((deal) => (
                      <div key={deal.id} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h3 className="font-medium">{deal.customer}</h3>
                              <p className="text-sm text-muted-foreground">{deal.vehicle}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">${deal.value.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{deal.lastActivity}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStageColor(deal.stage)}>
                              <span className="flex items-center space-x-1">
                                {getStageIcon(deal.stage)}
                                <span>{deal.stage.replace('-', ' ')}</span>
                              </span>
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {deal.probability}% probability
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                        <Progress value={deal.probability} className="mt-2 h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="won" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Won Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No won deals to display yet.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lost" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lost Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No lost deals to display yet.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Average Deal Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">$47,250</p>
                    <p className="text-sm text-green-600">↗ +8% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Win Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">32%</p>
                    <p className="text-sm text-green-600">↗ +5% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Avg. Days to Close</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">18 days</p>
                    <p className="text-sm text-green-600">↘ -3 days from last month</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}