import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { DollarSign, Plus, Search, Filter, User, Car, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function DealsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const deals = [
    {
      id: 1,
      customerName: "Anna Lindqvist",
      customerEmail: "anna.lindqvist@gmail.com",
      phone: "+46 70 123 4567",
      vehicle: "BMW X3 xDrive20d M Sport",
      year: 2024,
      listPrice: 575000,
      dealPrice: 545000,
      tradeInValue: 180000,
      finalPrice: 365000,
      stage: "Negotiation",
      probability: 85,
      expectedClose: "2024-01-20",
      salesperson: "Erik Svensson",
      notes: "Customer very interested, discussing financing options",
      createdDate: "2024-01-10",
      lastActivity: "2024-01-15"
    },
    {
      id: 2,
      customerName: "Magnus Eriksson",
      customerEmail: "magnus.e@outlook.com",
      phone: "+46 70 987 6543",
      vehicle: "Audi A4 Avant 2.0 TFSI",
      year: 2024,
      listPrice: 485000,
      dealPrice: 465000,
      tradeInValue: 0,
      finalPrice: 465000,
      stage: "Contract",
      probability: 95,
      expectedClose: "2024-01-17",
      salesperson: "Maria Karlsson",
      notes: "Contract ready for signing, financing approved",
      createdDate: "2024-01-08",
      lastActivity: "2024-01-15"
    },
    {
      id: 3,
      customerName: "Emma Johansson",
      customerEmail: "emma.johansson@company.se",
      phone: "+46 70 555 1234",
      vehicle: "Volvo XC90 T6 AWD Inscription",
      year: 2024,
      listPrice: 725000,
      dealPrice: 695000,
      tradeInValue: 0,
      finalPrice: 695000,
      stage: "Proposal",
      probability: 70,
      expectedClose: "2024-01-25",
      salesperson: "Lars Andersson",
      notes: "Business leasing deal, waiting for company approval",
      createdDate: "2024-01-12",
      lastActivity: "2024-01-14"
    },
    {
      id: 4,
      customerName: "Alexander Berg",
      customerEmail: "alex.berg@email.com",
      phone: "+46 70 222 9999",
      vehicle: "Mercedes C220d 4MATIC",
      year: 2023,
      listPrice: 475000,
      dealPrice: 445000,
      tradeInValue: 125000,
      finalPrice: 320000,
      stage: "Closed Won",
      probability: 100,
      expectedClose: "2024-01-12",
      salesperson: "Erik Svensson",
      notes: "Deal completed successfully, customer very satisfied",
      createdDate: "2024-01-05",
      lastActivity: "2024-01-12"
    }
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Lead": return "bg-blue-500";
      case "Qualified": return "bg-cyan-500";
      case "Proposal": return "bg-yellow-500";
      case "Negotiation": return "bg-orange-500";
      case "Contract": return "bg-purple-500";
      case "Closed Won": return "bg-green-500";
      case "Closed Lost": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-400";
    if (probability >= 60) return "text-yellow-400";
    if (probability >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "Closed Won": return CheckCircle;
      case "Closed Lost": return AlertCircle;
      default: return Clock;
    }
  };

  const filteredDeals = deals.filter(deal => 
    deal.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.salesperson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.stage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDealsValue = deals.reduce((sum, deal) => sum + deal.finalPrice, 0);
  const avgDealSize = totalDealsValue / deals.length;
  const closedWonDeals = deals.filter(deal => deal.stage === "Closed Won");
  const activeDeals = deals.filter(deal => !["Closed Won", "Closed Lost"].includes(deal.stage));

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl">
                <DollarSign size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Deals Pipeline</h1>
                <p className="text-white/70">Track and manage your sales deals</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all flex items-center space-x-2">
              <Plus size={18} />
              <span>New Deal</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <input
                type="text"
                placeholder="Search by customer, vehicle, salesperson, or stage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
            <div className="text-2xl font-bold text-white">{activeDeals.length}</div>
            <div className="text-white/70 text-sm">Active Deals</div>
            <div className="text-blue-400 text-xs">In pipeline</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{avgDealSize.toLocaleString()} kr</div>
            <div className="text-white/70 text-sm">Avg Deal Size</div>
            <div className="text-green-400 text-xs">This quarter</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{closedWonDeals.length}</div>
            <div className="text-white/70 text-sm">Closed Won</div>
            <div className="text-green-400 text-xs">This month</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{(totalDealsValue / 1000000).toFixed(1)}M kr</div>
            <div className="text-white/70 text-sm">Pipeline Value</div>
            <div className="text-purple-400 text-xs">Total potential</div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredDeals.map((deal) => {
            const StageIcon = getStageIcon(deal.stage);
            const discount = deal.listPrice - deal.dealPrice;
            const discountPercent = ((discount / deal.listPrice) * 100).toFixed(1);
            
            return (
              <div key={deal.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStageColor(deal.stage)}`}></div>
                      <span className="text-sm text-white/70">{deal.stage}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StageIcon size={16} className="text-white/60" />
                      <span className={`text-sm font-semibold ${getProbabilityColor(deal.probability)}`}>
                        {deal.probability}%
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-white/60">
                    Expected close: {deal.expectedClose}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-white/60" />
                      <span className="text-white font-semibold">{deal.customerName}</span>
                    </div>
                    <div className="text-sm text-white/70 space-y-1">
                      <div>{deal.customerEmail}</div>
                      <div>{deal.phone}</div>
                    </div>
                    <div className="text-sm">
                      <span className="text-white/60">Salesperson:</span>
                      <div className="text-white">{deal.salesperson}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Car size={16} className="text-white/60" />
                      <span className="text-white font-semibold">{deal.vehicle}</span>
                    </div>
                    <div className="text-sm text-white/70">Year: {deal.year}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-white/60">List Price:</span>
                        <div className="text-white">{deal.listPrice.toLocaleString()} kr</div>
                      </div>
                      <div>
                        <span className="text-white/60">Deal Price:</span>
                        <div className="text-green-400 font-semibold">{deal.dealPrice.toLocaleString()} kr</div>
                      </div>
                    </div>
                    {discount > 0 && (
                      <div className="text-xs text-orange-400">
                        Discount: {discount.toLocaleString()} kr ({discountPercent}%)
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-lg font-bold text-white">
                      Final Price: {deal.finalPrice.toLocaleString()} kr
                    </div>
                    {deal.tradeInValue > 0 && (
                      <div className="text-sm">
                        <span className="text-white/60">Trade-in Value:</span>
                        <div className="text-blue-400">{deal.tradeInValue.toLocaleString()} kr</div>
                      </div>
                    )}
                    <div className="text-sm text-white/60">
                      Created: {deal.createdDate}
                    </div>
                    <div className="text-sm text-white/60">
                      Last Activity: {deal.lastActivity}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="text-white/60 text-sm">Notes:</span>
                      <p className="text-white text-sm mt-1">{deal.notes}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {deal.stage !== "Closed Won" && deal.stage !== "Closed Lost" && (
                        <>
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors">
                            Update Stage
                          </button>
                          <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                            Add Note
                          </button>
                        </>
                      )}
                      <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDeals.length === 0 && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-12 text-center">
            <DollarSign size={48} className="mx-auto text-white/40 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No deals found</h3>
            <p className="text-white/60">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}