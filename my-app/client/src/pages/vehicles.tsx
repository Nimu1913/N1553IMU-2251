import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, ExternalLink, TrendingUp, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BlocketAdModal } from "@/components/blocket/blocket-ad-modal";

export default function Vehicles() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [showAdModal, setShowAdModal] = useState(false);

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  const { data: blocketAds = [] } = useQuery({
    queryKey: ["/api/blocket-ads"],
  });

  const getAdForVehicle = (vehicleId: string) => {
    return blocketAds.find((ad: any) => ad.vehicleId === vehicleId);
  };

  const handleCreateAd = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setShowAdModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "created":
        return "bg-green-100 text-green-800";
      case "published":
        return "bg-blue-100 text-blue-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-auto bg-secondary/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Vehicle Inventory</h1>
                <p className="text-muted-foreground">Manage your vehicles and Blocket advertisements</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle: any) => {
                  const ad = getAdForVehicle(vehicle.id);
                  return (
                    <Card key={vehicle.id} className="card-hover" data-testid={`vehicle-card-${vehicle.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Car className="w-8 h-8 text-primary" />
                          </div>
                          {ad ? (
                            <Badge className={getStatusColor(ad.status)} data-testid={`ad-status-${vehicle.id}`}>
                              {ad.status}
                            </Badge>
                          ) : (
                            <Badge variant="outline" data-testid={`no-ad-${vehicle.id}`}>
                              Not Listed
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg text-foreground" data-testid={`vehicle-title-${vehicle.id}`}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          {vehicle.trim && (
                            <p className="text-sm text-muted-foreground">{vehicle.trim}</p>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Color: {vehicle.color}</span>
                            <span className="text-muted-foreground">{vehicle.mileage} km</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-foreground" data-testid={`vehicle-price-${vehicle.id}`}>
                              {vehicle.price ? `${parseInt(vehicle.price).toLocaleString()} SEK` : "Price on request"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">VIN: {vehicle.vin}</p>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          {ad ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                data-testid={`view-ad-${vehicle.id}`}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Ad
                              </Button>
                              {ad.blocketAdId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => window.open(`https://blocket.se/annons/${ad.blocketAdId}`, '_blank')}
                                  data-testid={`blocket-link-${vehicle.id}`}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Blocket
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                data-testid={`bump-ad-${vehicle.id}`}
                              >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Bump
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => handleCreateAd(vehicle)}
                              className="w-full"
                              data-testid={`create-ad-${vehicle.id}`}
                            >
                              Create Blocket Ad
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {vehicles.length === 0 && !isLoading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No vehicles in inventory</h3>
                  <p className="text-muted-foreground">Add vehicles to start creating Blocket advertisements</p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      <BlocketAdModal
        open={showAdModal}
        onOpenChange={setShowAdModal}
        vehicle={selectedVehicle}
      />
    </>
  );
}