import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { MapPin, Plus, Search, Filter, Eye, Edit, RotateCcw, TrendingUp, Clock, Car } from "lucide-react";

export default function BlocketPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const listings = [
    {
      id: 1,
      vehicle: "BMW X3 xDrive20d",
      year: 2023,
      price: 459000,
      originalPrice: 475000,
      views: 1247,
      inquiries: 23,
      status: "Active",
      daysListed: 5,
      location: "Stockholm",
      blocketId: "BL123456789",
      images: 12,
      lastSync: "2024-01-15 10:30"
    },
    {
      id: 2,
      vehicle: "Audi A4 Avant 2.0 TFSI",
      year: 2024,
      price: 389000,
      originalPrice: 389000,
      views: 892,
      inquiries: 18,
      status: "Active",
      daysListed: 12,
      location: "Göteborg",
      blocketId: "BL987654321",
      images: 15,
      lastSync: "2024-01-15 09:45"
    },
    {
      id: 3,
      vehicle: "Volvo XC90 T6 AWD",
      year: 2024,
      price: 649000,
      originalPrice: 675000,
      views: 2341,
      inquiries: 42,
      status: "Sold",
      daysListed: 8,
      location: "Malmö",
      blocketId: "BL456789123",
      images: 18,
      lastSync: "2024-01-14 16:20"
    },
    {
      id: 4,
      vehicle: "Mercedes C220d 4MATIC",
      year: 2023,
      price: 429000,
      originalPrice: 445000,
      views: 654,
      inquiries: 9,
      status: "Paused",
      daysListed: 18,
      location: "Uppsala",
      blocketId: "BL789123456",
      images: 10,
      lastSync: "2024-01-15 08:15"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "Sold": return "bg-blue-500";
      case "Paused": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const filteredListings = listings.filter(listing => 
    listing.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.blocketId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl">
                <MapPin size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Blocket Integration</h1>
                <p className="text-white/70">Manage your Blocket.se listings</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2">
                <RotateCcw size={18} />
                <span>Sync All</span>
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all flex items-center space-x-2">
                <Plus size={18} />
                <span>New Listing</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <input
                type="text"
                placeholder="Search by vehicle, location, or Blocket ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
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
            <div className="text-2xl font-bold text-white">47</div>
            <div className="text-white/70 text-sm">Active Listings</div>
            <div className="text-green-400 text-xs">+3 this week</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">12,456</div>
            <div className="text-white/70 text-sm">Total Views</div>
            <div className="text-blue-400 text-xs">This month</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">234</div>
            <div className="text-white/70 text-sm">Inquiries</div>
            <div className="text-purple-400 text-xs">+18% increase</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">8</div>
            <div className="text-white/70 text-sm">Sold This Month</div>
            <div className="text-green-400 text-xs">Great results!</div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(listing.status)}`}></div>
                    <span className="text-xs text-white/70">{listing.status}</span>
                  </div>
                  <div className="text-xs text-white/60">
                    ID: {listing.blocketId}
                  </div>
                  <div className="text-xs text-white/60 flex items-center space-x-1">
                    <Clock size={12} />
                    <span>Listed {listing.daysListed} days ago</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <Eye size={16} className="text-white/60" />
                  </button>
                  <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <Edit size={16} className="text-white/60" />
                  </button>
                  <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <RotateCcw size={16} className="text-green-400" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    {listing.vehicle} ({listing.year})
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-white/70">
                    <div className="flex items-center space-x-1">
                      <MapPin size={14} />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Car size={14} />
                      <span>{listing.images} photos</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-white/60 text-sm">Current Price:</span>
                    <div className="text-xl font-bold text-white">
                      {listing.price.toLocaleString()} kr
                    </div>
                    {listing.originalPrice !== listing.price && (
                      <div className="text-sm text-white/50 line-through">
                        {listing.originalPrice.toLocaleString()} kr
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Views:</span>
                      <div className="text-white font-semibold flex items-center space-x-1">
                        <Eye size={14} />
                        <span>{listing.views.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-white/60">Inquiries:</span>
                      <div className="text-white font-semibold">{listing.inquiries}</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/50">
                    Last sync: {listing.lastSync}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp size={14} className="text-green-400" />
                  <span className="text-green-400">
                    {(listing.inquiries / listing.views * 100).toFixed(1)}% inquiry rate
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors">
                    View on Blocket
                  </button>
                  <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                    Boost Listing
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-12 text-center">
            <MapPin size={48} className="mx-auto text-white/40 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No listings found</h3>
            <p className="text-white/60">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}