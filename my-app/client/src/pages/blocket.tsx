import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  ExternalLink, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Calendar,
  Plus,
  Search,
  Filter,
  BarChart3,
  Target,
  DollarSign,
  RefreshCw,
  Edit,
  Trash2,
  Upload,
  Settings
} from "lucide-react";

export default function Blocket() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  const { data: blocketAds = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/blocket-ads"],
  });

  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  // Mock performance data
  const performanceData = {
    totalAds: blocketAds.length,
    activeAds: blocketAds.filter((ad: any) => ad.status === 'created').length,
    totalViews: 12340,
    totalClicks: 567,
    totalInquiries: 89,
    adSpend: 2450,
    avgCTR: 4.6,
    conversionRate: 15.7
  };

  const competitorData = [
    { make: "BMW", avgPrice: 245000, ourPrice: 239000, priceAdvantage: -6000 },
    { make: "Audi", avgPrice: 267000, ourPrice: 259000, priceAdvantage: -8000 },
    { make: "Mercedes", avgPrice: 289000, ourPrice: 295000, priceAdvantage: 6000 },
    { make: "Volvo", avgPrice: 234000, ourPrice: 229000, priceAdvantage: -5000 }
  ];

  const adTemplates = [
    {
      id: "1",
      name: "Luxury Car Template",
      category: "Premium Vehicles",
      description: "Perfect for high-end vehicles with premium features"
    },
    {
      id: "2", 
      name: "Family Car Template",
      category: "Family Vehicles",
      description: "Ideal for SUVs and family-friendly vehicles"
    },
    {
      id: "3",
      name: "Sports Car Template", 
      category: "Performance Vehicles",
      description: "Designed for sports cars and performance vehicles"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "created":
        return "bg-green-100 text-green-800";
      case "published":
        return "bg-blue-100 text-blue-800"; 
      case "error":
        return "bg-red-100 text-red-800";
      case "deleted":
        return "bg-gray-100 text-gray-800";
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
              <h1 className="text-2xl font-bold text-foreground">Blocket Management</h1>
              <p className="text-muted-foreground">Comprehensive Blocket advertising management and analytics</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" data-testid="button-bulk-operations">
                <Settings className="w-4 h-4 mr-2" />
                Bulk Actions
              </Button>
              <Button data-testid="button-create-ad">
                <Plus className="w-4 h-4 mr-2" />
                Create Ad
              </Button>
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList>
              <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="ads" data-testid="tab-ads">Ad Management</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
              <TabsTrigger value="competitors" data-testid="tab-competitors">Market Insights</TabsTrigger>
              <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Ads</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="metric-total-ads">{performanceData.totalAds}</p>
                        <p className="text-xs text-green-600 mt-1">↗ {performanceData.activeAds} active</p>
                      </div>
                      <ExternalLink className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="metric-total-views">{performanceData.totalViews.toLocaleString()}</p>
                        <p className="text-xs text-green-600 mt-1">↗ +12% this week</p>
                      </div>
                      <Eye className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="metric-ctr">{performanceData.avgCTR}%</p>
                        <p className="text-xs text-green-600 mt-1">↗ +0.8% this week</p>
                      </div>
                      <MousePointer className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ad Spend</p>
                        <p className="text-2xl font-bold text-foreground" data-testid="metric-ad-spend">{performanceData.adSpend.toLocaleString()} SEK</p>
                        <p className="text-xs text-green-600 mt-1">ROI: {Math.round(performanceData.conversionRate * 10)}%</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Ad Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Top Performing Ads (Last 7 days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blocketAds.slice(0, 5).map((ad: any, index: number) => (
                      <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`top-ad-${index}`}>
                        <div className="flex-1">
                          <h3 className="font-medium">{ad.title}</h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className="text-muted-foreground">Views: {Math.floor(Math.random() * 500) + 100}</span>
                            <span className="text-muted-foreground">Clicks: {Math.floor(Math.random() * 50) + 10}</span>
                            <span className="text-muted-foreground">CTR: {(Math.random() * 5 + 2).toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(ad.status || 'created')}>
                            {ad.status || 'created'}
                          </Badge>
                          <Button variant="outline" size="sm" data-testid={`view-ad-${ad.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ads" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder="Search ads..." 
                      className="pl-9 w-64"
                      data-testid="input-search-ads"
                    />
                  </div>
                  <Button variant="outline" data-testid="button-filter-ads">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" data-testid="button-bulk-actions">
                    Bulk Actions
                  </Button>
                  <Button variant="outline" data-testid="button-sync-ads">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading ads...</p>
                    </div>
                  ) : blocketAds.length === 0 ? (
                    <div className="p-8 text-center">
                      <ExternalLink className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Blocket ads yet</h3>
                      <p className="text-muted-foreground mb-4">Create your first advertisement to start reaching customers on Blocket</p>
                      <Button data-testid="button-create-first-ad">Create Your First Ad</Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {blocketAds.map((ad: any) => (
                        <div key={ad.id} className="p-6" data-testid={`ad-row-${ad.id}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="font-medium">{ad.title}</h3>
                                <Badge className={getStatusColor(ad.status || 'created')}>
                                  {ad.status || 'created'}
                                </Badge>
                                {ad.blocketAdId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`https://blocket.se/annons/${ad.blocketAdId}`, '_blank')}
                                    data-testid={`external-link-${ad.id}`}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              <div className="grid grid-cols-5 gap-4 mt-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Price</p>
                                  <p className="font-medium">{parseInt(ad.price || "0").toLocaleString()} SEK</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Views</p>
                                  <p className="font-medium">{Math.floor(Math.random() * 500) + 50}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Clicks</p>
                                  <p className="font-medium">{Math.floor(Math.random() * 50) + 5}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Inquiries</p>
                                  <p className="font-medium">{Math.floor(Math.random() * 10) + 1}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Created</p>
                                  <p className="font-medium">{new Date(ad.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" data-testid={`edit-ad-${ad.id}`}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" data-testid={`bump-ad-${ad.id}`}>
                                <TrendingUp className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" data-testid={`delete-ad-${ad.id}`}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Views</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={75} className="w-24 h-2" />
                          <span className="text-sm font-medium">+23%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Click-through Rate</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={45} className="w-24 h-2" />
                          <span className="text-sm font-medium">+12%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Inquiries</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={60} className="w-24 h-2" />
                          <span className="text-sm font-medium">+18%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Conversion Rate</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={35} className="w-24 h-2" />
                          <span className="text-sm font-medium">+8%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Revenue from Blocket</span>
                        <span className="text-lg font-bold" data-testid="blocket-revenue">1.2M SEK</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Cost per Lead</span>
                        <span className="text-lg font-bold" data-testid="cost-per-lead">28 SEK</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Return on Ad Spend</span>
                        <span className="text-lg font-bold text-green-600" data-testid="roas">490%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Avg Deal Size</span>
                        <span className="text-lg font-bold" data-testid="avg-deal-size">247K SEK</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="competitors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Market Price Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {competitorData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`competitor-${index}`}>
                        <div className="flex-1">
                          <h3 className="font-medium">{data.make}</h3>
                          <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Market Avg</p>
                              <p className="font-medium">{data.avgPrice.toLocaleString()} SEK</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Your Price</p>
                              <p className="font-medium">{data.ourPrice.toLocaleString()} SEK</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Advantage</p>
                              <p className={`font-medium ${data.priceAdvantage < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {data.priceAdvantage > 0 ? '+' : ''}{data.priceAdvantage.toLocaleString()} SEK
                              </p>
                            </div>
                          </div>
                        </div>
                        <Badge variant={data.priceAdvantage < 0 ? 'default' : 'destructive'}>
                          {data.priceAdvantage < 0 ? 'Competitive' : 'Above Market'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Ad Templates</span>
                    <Button size="sm" data-testid="button-create-template">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Template
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {adTemplates.map((template) => (
                      <Card key={template.id} data-testid={`template-${template.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">{template.name}</h3>
                            <Button variant="ghost" size="sm" data-testid={`edit-template-${template.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                          <Badge variant="outline" className="mb-2">{template.category}</Badge>
                          <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1" data-testid={`preview-template-${template.id}`}>
                              Preview
                            </Button>
                            <Button size="sm" className="flex-1" data-testid={`use-template-${template.id}`}>
                              Use Template
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
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