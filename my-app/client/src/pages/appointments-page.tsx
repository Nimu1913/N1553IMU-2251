import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Calendar, Clock, User, Phone, Car, Plus, Search, Filter } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const appointments = [
    {
      id: 1,
      customerName: "Anna Lindqvist",
      phone: "+46 70 123 4567",
      vehicle: "2024 BMW X3",
      type: "Test Drive",
      date: "2024-01-15",
      time: "10:00",
      status: "Confirmed",
      notes: "Interested in premium package"
    },
    {
      id: 2,
      customerName: "Erik Johansson",
      phone: "+46 70 987 6543",
      vehicle: "2023 Audi A4",
      type: "Service",
      date: "2024-01-15",
      time: "14:30",
      status: "Pending",
      notes: "Annual maintenance"
    },
    {
      id: 3,
      customerName: "Maria Svensson",
      phone: "+46 70 555 1234",
      vehicle: "2024 Volvo XC90",
      type: "Sales Meeting",
      date: "2024-01-16",
      time: "11:15",
      status: "Confirmed",
      notes: "Family car consultation"
    },
    {
      id: 4,
      customerName: "Lars Andersson",
      phone: "+46 70 222 9999",
      vehicle: "2023 Mercedes C-Class",
      type: "Test Drive",
      date: "2024-01-16",
      time: "15:45",
      status: "Cancelled",
      notes: "Rescheduling requested"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-green-500";
      case "Pending": return "bg-yellow-500";
      case "Cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Test Drive": return "bg-blue-500";
      case "Service": return "bg-purple-500";
      case "Sales Meeting": return "bg-indigo-500";
      default: return "bg-gray-500";
    }
  };

  const filteredAppointments = appointments.filter(appointment => 
    appointment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div>
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Appointments</h1>
                <p className="text-white/70">Manage your dealership appointments</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2">
              <Plus size={18} />
              <span>New Appointment</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
              <input
                type="text"
                placeholder="Search by customer, vehicle, or type..."
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
            <div className="text-2xl font-bold text-white">15</div>
            <div className="text-white/70 text-sm">Today's Appointments</div>
            <div className="text-green-400 text-xs">3 confirmed</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">8</div>
            <div className="text-white/70 text-sm">Test Drives</div>
            <div className="text-blue-400 text-xs">This week</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">23</div>
            <div className="text-white/70 text-sm">This Week</div>
            <div className="text-purple-400 text-xs">+5 from last week</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">92%</div>
            <div className="text-white/70 text-sm">Show Rate</div>
            <div className="text-green-400 text-xs">Excellent!</div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`}></div>
                    <span className="text-xs text-white/70">{appointment.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs text-white ${getTypeColor(appointment.type)}`}>
                      {appointment.type}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-white/60">
                  <Clock size={16} />
                  <span className="text-sm">{appointment.date} at {appointment.time}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-white/60" />
                    <span className="text-white/60 text-sm">Customer:</span>
                  </div>
                  <div className="text-white font-semibold">{appointment.customerName}</div>
                  <div className="flex items-center space-x-2 text-white/70">
                    <Phone size={14} />
                    <span className="text-sm">{appointment.phone}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Car size={16} className="text-white/60" />
                    <span className="text-white/60 text-sm">Vehicle:</span>
                  </div>
                  <div className="text-white font-semibold">{appointment.vehicle}</div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-white/60 text-sm">Notes:</span>
                  <div className="text-white text-sm">{appointment.notes}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-12 text-center">
            <Calendar size={48} className="mx-auto text-white/40 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No appointments found</h3>
            <p className="text-white/60">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}