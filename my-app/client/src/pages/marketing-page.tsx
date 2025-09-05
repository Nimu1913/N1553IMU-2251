import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { TrendingUp, Plus, Search, Filter, Mail, MessageSquare, Target, BarChart3, Users, Eye, Send } from "lucide-react";

export default function MarketingPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("campaigns");

  const campaigns = [
    {
      id: 1,
      name: "BMW X3 Summer Promotion",
      type: "Email",
      status: "Active",
      sent: 2847,
      opens: 1523,
      clicks: 287,
      conversions: 23,
      startDate: "2024-01-10",
      endDate: "2024-02-10",
      budget: 15000,
      spent: 8400
    },
    {
      id: 2,
      name: "Volvo Service Reminder",
      type: "SMS",
      status: "Completed",
      sent: 1243,
      opens: 1156,
      clicks: 89,
      conversions: 67,
      startDate: "2024-01-05",
      endDate: "2024-01-12",
      budget: 5000,
      spent: 4200
    },
    {
      id: 3,
      name: "New Year Car Deals",
      type: "Social Media",
      status: "Paused",
      sent: 5600,
      opens: 4200,
      clicks: 630,
      conversions: 45,
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      budget: 25000,
      spent: 12300
    }
  ];

  const templates = [
    {
      id: 1,
      name: "Welcome New Customer",
      type: "Email",
      category: "Onboarding",
      usageCount: 234,
      lastUsed: "2024-01-14"
    },
    {
      id: 2,
      name: "Test Drive Follow-up",
      type: "SMS",
      category: "Follow-up",
      usageCount: 156,
      lastUsed: "2024-01-15"
    },
    {
      id: 3,
      name: "Service Appointment Reminder",
      type: "Email",
      category: "Service",
      usageCount: 892,
      lastUsed: "2024-01-15"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Completed": return "bg-blue-500";
      case "Paused": return "bg-yellow-500";
      case "Draft": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Email": return Mail;
      case "SMS": return MessageSquare;
      case "Social Media": return Users;
      default: return Target;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Marketing Center</h1>
                <p className="text-white/70">Create and manage marketing campaigns</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all flex items-center space-x-2">
              <Plus size={18} />
              <span>New Campaign</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedTab("campaigns")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTab === "campaigns" 
                    ? "bg-white/20 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setSelectedTab("templates")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTab === "templates" 
                    ? "bg-white/20 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                Templates
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Search campaigns or templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2">
                <Filter size={18} />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">12</div>
            <div className="text-white/70 text-sm">Active Campaigns</div>
            <div className="text-green-400 text-xs">+2 this month</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">24.8%</div>
            <div className="text-white/70 text-sm">Open Rate</div>
            <div className="text-blue-400 text-xs">Above average</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">5.2%</div>
            <div className="text-white/70 text-sm">Click Rate</div>
            <div className="text-purple-400 text-xs">+0.8% this month</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">147</div>
            <div className="text-white/70 text-sm">Conversions</div>
            <div className="text-green-400 text-xs">This month</div>
          </div>
        </div>

        {selectedTab === "campaigns" ? (
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => {
              const TypeIcon = getTypeIcon(campaign.type);
              const openRate = ((campaign.opens / campaign.sent) * 100).toFixed(1);
              const clickRate = ((campaign.clicks / campaign.opens) * 100).toFixed(1);
              const conversionRate = ((campaign.conversions / campaign.clicks) * 100).toFixed(1);
              
              return (
                <div key={campaign.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <TypeIcon size={20} className="text-pink-400" />
                        <span className="text-sm text-white/70">{campaign.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(campaign.status)}`}></div>
                        <span className="text-xs text-white/70">{campaign.status}</span>
                      </div>
                    </div>
                    <div className="text-sm text-white/60">
                      {campaign.startDate} - {campaign.endDate}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Budget:</span>
                          <span className="text-white">{campaign.budget.toLocaleString()} kr</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Spent:</span>
                          <span className="text-white">{campaign.spent.toLocaleString()} kr</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                            style={{width: `${(campaign.spent / campaign.budget) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Sent:</span>
                        <div className="text-white font-semibold flex items-center space-x-1">
                          <Send size={14} />
                          <span>{campaign.sent.toLocaleString()}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-white/60">Opens:</span>
                        <div className="text-white font-semibold flex items-center space-x-1">
                          <Eye size={14} />
                          <span>{campaign.opens.toLocaleString()}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-white/60">Clicks:</span>
                        <div className="text-white font-semibold">{campaign.clicks.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-white/60">Conversions:</span>
                        <div className="text-white font-semibold">{campaign.conversions}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Open Rate:</span>
                          <span className="text-green-400 font-semibold">{openRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Click Rate:</span>
                          <span className="text-blue-400 font-semibold">{clickRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Conv. Rate:</span>
                          <span className="text-purple-400 font-semibold">{conversionRate}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors">
                          View Details
                        </button>
                        <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                          Duplicate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const TypeIcon = getTypeIcon(template.type);
              return (
                <div key={template.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <TypeIcon size={20} className="text-pink-400" />
                      <span className="text-sm text-white/70">{template.type}</span>
                    </div>
                    <div className="text-xs text-white/60">{template.category}</div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Used:</span>
                        <div className="text-white font-semibold">{template.usageCount} times</div>
                      </div>
                      <div>
                        <span className="text-white/60">Last Used:</span>
                        <div className="text-white">{template.lastUsed}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors">
                        Use Template
                      </button>
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(selectedTab === "campaigns" ? filteredCampaigns : filteredTemplates).length === 0 && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-12 text-center">
            <TrendingUp size={48} className="mx-auto text-white/40 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No {selectedTab} found
            </h3>
            <p className="text-white/60">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}