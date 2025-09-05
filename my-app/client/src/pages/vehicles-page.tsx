import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Car, Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function VehiclesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock vehicle data
  const vehicles = [
    {
      id: 1,
      make: "BMW",
      model: "X3",
      year: 2023,
      vin: "WBA5A5C51JD123456",
      color: "Mineral Grey Metallic",
      mileage: 15420,
      price: 45900,
      status: "Available",
      location: "Lot A-12"
    },
    {
      id: 2,
      make: "Audi",
      model: "A4",
      year: 2024,
      vin: "WAUENAF4XLN654321",
      color: "Glacier White",
      mileage: 8750,
      price: 52300,
      status: "Reserved",
      location: "Showroom"
    },
    {
      id: 3,
      make: "Mercedes-Benz",
      model: "C-Class",
      year: 2023,
      vin: "WDDGF4HB5CR987654",
      color: "Obsidian Black",
      mileage: 22100,
      price: 48700,
      status: "Sold",
      location: "Delivered"
    },
    {
      id: 4,
      make: "Volvo",
      model: "XC90",
      year: 2024,
      vin: "YV4A22PK1R1567890",
      color: "Crystal White Pearl",
      mileage: 5200,
      price: 67500,
      status: "Available",
      location: "Lot B-7"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-500";
      case "Reserved": return "bg-yellow-500";
      case "Sold": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <Car size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Vehicle Inventory</h1>
                <p className="text-white/70">Manage your dealership's vehicle stock</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2">
              <Plus size={18} />
              <span>Add Vehicle</span>
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <input
                type="text"
                placeholder="Search by make, model, or VIN..."
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

        {/* Vehicle Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">24</div>
            <div className="text-white/70 text-sm">Total Vehicles</div>
            <div className="text-green-400 text-xs">+3 this week</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">18</div>
            <div className="text-white/70 text-sm">Available</div>
            <div className="text-blue-400 text-xs">Ready for sale</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">4</div>
            <div className="text-white/70 text-sm">Reserved</div>
            <div className="text-yellow-400 text-xs">Pending delivery</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">2</div>
            <div className="text-white/70 text-sm">Sold Today</div>
            <div className="text-green-400 text-xs">Great progress!</div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.status)}`}></div>
                  <span className="text-xs text-white/70">{vehicle.status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-white/20 rounded">
                    <Edit size={14} className="text-white/60" />
                  </button>
                  <button className="p-1 hover:bg-white/20 rounded">
                    <Trash2 size={14} className="text-white/60" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-white/60 text-sm">{vehicle.color}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">VIN:</span>
                    <div className="text-white font-mono text-xs">{vehicle.vin}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Mileage:</span>
                    <div className="text-white">{vehicle.mileage.toLocaleString()} mi</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <div>
                    <span className="text-white/60 text-sm">Price:</span>
                    <div className="text-xl font-bold text-white">${vehicle.price.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-white/60 text-sm">Location:</span>
                    <div className="text-white text-sm">{vehicle.location}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-12 text-center">
            <Car size={48} className="mx-auto text-white/40 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No vehicles found</h3>
            <p className="text-white/60">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}