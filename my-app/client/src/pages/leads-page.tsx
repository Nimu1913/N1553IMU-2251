import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Users, Plus, Search, Filter, Phone, Mail, MapPin, Star, TrendingUp } from "lucide-react";

export default function LeadsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const leads = [
    {
      id: 1,
      name: "Sofia Andersson",
      email: "sofia.andersson@gmail.com",
      phone: "+46 70 123 4567",
      location: "Stockholm",
      interestedVehicle: "BMW X3 2024",
      budget: "450,000 - 500,000 SEK",
      source: "Website",
      score: 95,
      status: "Hot",
      lastContact: "2024-01-14",
      notes: "Ready to purchase, needs financing options"
    },
    {
      id: 2,
      name: "Magnus Eriksson",
      email: "magnus.e@outlook.com",
      phone: "+46 70 987 6543",
      location: "Göteborg",
      interestedVehicle: "Audi A4 2023",
      budget: "350,000 - 400,000 SEK",
      source: "Blocket",
      score: 78,
      status: "Warm",
      lastContact: "2024-01-12",
      notes: "Comparing different models, price sensitive"
    },
    {
      id: 3,
      name: "Emma Johansson",
      email: "emma.johansson@company.se",
      phone: "+46 70 555 1234",
      location: "Malmö",
      interestedVehicle: "Volvo XC90 2024",
      budget: "600,000+ SEK",
      source: "Referral",
      score: 88,
      status: "Hot",
      lastContact: "2024-01-13",
      notes: "Business purchase, needs company car package"
    },
    {
      id: 4,
      name: "Alexander Berg",
      email: "alex.berg@email.com",
      phone: "+46 70 222 9999",
      location: "Uppsala",
      interestedVehicle: "Mercedes C-Class 2023",
      budget: "400,000 - 450,000 SEK",
      source: "Social Media",
      score: 62,
      status: "Cold",
      lastContact: "2024-01-10",
      notes: "Initial inquiry, needs follow-up"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hot": return "bg-red-500";
      case "Warm": return "bg-yellow-500";
      case "Cold": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-red-400";
    if (score >= 60) return "text-yellow-400";
    return "text-blue-400";
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.interestedVehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Leads Management</h1>
                <p className="text-white/70">Track and convert your sales prospects</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2">
              <Plus size={18} />
              <span>Add Lead</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <input
                type="text"
                placeholder="Search by name, email, vehicle, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <button className="px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">247</div>
            <div className="text-white/70 text-sm">Total Leads</div>
            <div className="text-green-400 text-xs">+12 this week</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">89</div>
            <div className="text-white/70 text-sm">Hot Leads</div>
            <div className="text-red-400 text-xs">Ready to buy</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">24.8%</div>
            <div className="text-white/70 text-sm">Conversion Rate</div>
            <div className="text-yellow-400 text-xs">Above average</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">156</div>
            <div className="text-white/70 text-sm">This Month</div>
            <div className="text-green-400 text-xs">+23% growth</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(lead.status)}`}></div>
                  <span className="text-xs text-white/70">{lead.status}</span>
                  <div className="flex items-center space-x-1">
                    <Star size={14} className={getScoreColor(lead.score)} />
                    <span className={`text-sm font-semibold ${getScoreColor(lead.score)}`}>
                      {lead.score}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-white/60">
                  Last contact: {lead.lastContact}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{lead.name}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-white/70">
                    <div className="flex items-center space-x-1">
                      <Mail size={14} />
                      <span>{lead.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone size={14} />
                      <span>{lead.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 mt-1 text-sm text-white/70">
                    <MapPin size={14} />
                    <span>{lead.location}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Interested Vehicle:</span>
                    <div className="text-white font-medium">{lead.interestedVehicle}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Budget:</span>
                    <div className="text-white font-medium">{lead.budget}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Source:</span>
                    <div className="text-white">{lead.source}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={14} className="text-green-400" />
                    <span className="text-green-400 text-xs">High potential</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-white/20">
                  <span className="text-white/60 text-sm">Notes:</span>
                  <div className="text-white text-sm mt-1">{lead.notes}</div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors">
                      Call
                    </button>
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                      Email
                    </button>
                  </div>
                  <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors">
                    Schedule Meeting
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-12 text-center">
            <Users size={48} className="mx-auto text-white/40 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No leads found</h3>
            <p className="text-white/60">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}