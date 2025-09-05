import { useState, useRef } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useAccount } from "@/contexts/account-context";
// Mock data removed - now using API data from account context
import { Car, Plus, Search, Filter, Edit, Trash2, X, Upload, Zap, Facebook, Instagram, Globe, Send, Eye, Maximize2 } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import VehicleViewer3D from "@/components/3d/VehicleViewer3D";

export default function VehiclesPage() {
  const { user } = useAuth();
  const { currentAccount } = useAccount();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdConfigurator, setShowAdConfigurator] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    vin: '',
    mileage: '',
    description: '',
    images: []
  });
  const [adConfig, setAdConfig] = useState({
    title: 'Premium BMW X3 - Pristine Condition',
    description: 'Exceptional vehicle with full service history. Low mileage, one owner.',
    price: '459,000 SEK',
    template: 'modern',
    channels: {
      facebook: true,
      instagram: false,
      blocket: true,
      autotrader: false
    }
  });
  const [selectedVehicleFor3D, setSelectedVehicleFor3D] = useState(null);
  const [show3DModal, setShow3DModal] = useState(false);
  const fileInputRef = useRef(null);

  // Get vehicles for current account
  const getDealerIdForVehicles = () => {
    if (!currentAccount) return null;
    
    // If it's a mother account (network or independent), use the first available dealer ID
    if (currentAccount.type === 'mother') {
      // For independent dealers that are mother accounts, use their own ID
      if (!currentAccount.parentId) {
        return currentAccount.id;
      }
      // For network mother accounts, get first network dealer
      const networkDealers = []; // Mock data removed
      return networkDealers.length > 0 ? networkDealers[0].id : null;
    }
    
    // For child accounts, use their own ID
    return currentAccount.id;
  };
  
  const dealerIdForVehicles = getDealerIdForVehicles();
  // Static vehicle data for demo purposes - replace with API call
  const rawVehicles = [
    {
      id: 'v1', make: 'BMW', model: 'X3', year: 2023, trim: 'xDrive30i', 
      color: 'White', mileage: 12500, price: 459000, status: 'available'
    },
    {
      id: 'v2', make: 'Tesla', model: 'Model 3', year: 2023, trim: 'Long Range', 
      color: 'Red', mileage: 8200, price: 589000, status: 'available'
    },
    {
      id: 'v3', make: 'Mercedes-Benz', model: 'C-Class', year: 2022, trim: 'C300', 
      color: 'Black', mileage: 15000, price: 425000, status: 'reserved'
    }
  ];
  
  // Convert to display format
  const vehicles = rawVehicles.map(vehicle => ({
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    vin: vehicle.vin,
    color: vehicle.color,
    mileage: vehicle.mileage,
    price: vehicle.price / 1000, // Convert from SEK to thousands
    status: vehicle.status === 'available' ? 'Available' : 
            vehicle.status === 'sold' ? 'Sold' : 
            vehicle.status === 'reserved' ? 'Reserved' : 'Maintenance',
    location: vehicle.status === 'sold' ? 'Delivered' : 
              vehicle.status === 'available' ? 'Showroom' : 
              vehicle.status === 'reserved' ? 'Reserved Bay' : 'Service',
    images: vehicle.images.length > 0 ? vehicle.images : ['/api/placeholder/400/300'],
    condition: vehicle.condition,
    fuelType: vehicle.fuelType,
    features: vehicle.features || []
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-500";
      case "Reserved": return "bg-yellow-500";
      case "Sold": return "bg-gray-500";
      case "Maintenance": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Image upload handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            name: file.name
          };
          setUploadedImages(prev => [...prev, newImage]);
          setNewVehicle(prev => ({
            ...prev,
            images: [...prev.images, newImage]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    setNewVehicle(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const createAd = () => {
    // Simulate ad creation and publishing
    console.log('Creating ad with config:', adConfig);
    alert(`Ad created and published to selected channels!\n\nChannels: ${Object.keys(adConfig.channels).filter(key => adConfig.channels[key]).join(', ')}`);
    setShowAdConfigurator(false);
  };

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
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowAdConfigurator(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2"
              >
                <Zap size={18} />
                <span>Create Ad</span>
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Add Vehicle</span>
              </button>
            </div>
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
            <div className="text-2xl font-bold text-white">{vehicles.length}</div>
            <div className="text-white/70 text-sm">Total Vehicles</div>
            <div className="text-blue-400 text-xs">{currentAccount?.dealershipName || 'Current Location'}</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{vehicles.filter(v => v.status === 'Available').length}</div>
            <div className="text-white/70 text-sm">Available</div>
            <div className="text-green-400 text-xs">Ready for sale</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{vehicles.filter(v => v.status === 'Reserved').length}</div>
            <div className="text-white/70 text-sm">Reserved</div>
            <div className="text-yellow-400 text-xs">Pending delivery</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{vehicles.filter(v => v.status === 'Sold').length}</div>
            <div className="text-white/70 text-sm">Sold</div>
            <div className="text-green-400 text-xs">Completed sales</div>
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
                  <button 
                    onClick={() => {
                      setSelectedVehicleFor3D(vehicle);
                      setShow3DModal(true);
                    }}
                    className="p-1 hover:bg-white/20 rounded"
                    title="3D View"
                  >
                    <Maximize2 size={14} className="text-blue-400" />
                  </button>
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
                    <div className="text-xl font-bold text-white">{Math.round(vehicle.price).toLocaleString()}k SEK</div>
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
        
        {/* Add Vehicle Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add New Vehicle</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Vehicle Form */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Make</label>
                      <input
                        type="text"
                        value={newVehicle.make}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, make: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="BMW"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Model</label>
                      <input
                        type="text"
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="X3"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Year</label>
                      <input
                        type="number"
                        value={newVehicle.year}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Price (SEK)</label>
                      <input
                        type="number"
                        value={newVehicle.price}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="450000"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">VIN</label>
                      <input
                        type="text"
                        value={newVehicle.vin}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, vin: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="WBA5A5C51JD123456"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">Mileage</label>
                      <input
                        type="number"
                        value={newVehicle.mileage}
                        onChange={(e) => setNewVehicle(prev => ({ ...prev, mileage: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="15000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newVehicle.description}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the vehicle condition, features, etc."
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setShowAddModal(false)}
                      className="px-6 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2">
                      <Plus size={18} />
                      <span>Add Vehicle</span>
                    </button>
                  </div>
                </div>
                
                {/* Image Upload */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Vehicle Images</label>
                    <div 
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        dragOver 
                          ? 'border-blue-400 bg-blue-500/10' 
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload size={48} className="mx-auto text-white/40 mb-4" />
                      <p className="text-white/70 mb-2">Drag & drop images here</p>
                      <p className="text-white/50 text-sm mb-4">or click to browse</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Select Images
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  {/* Image Previews */}
                  {uploadedImages.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Uploaded Images ({uploadedImages.length})</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {uploadedImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <img 
                              src={image.preview} 
                              alt={image.name}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(image.id)}
                              className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                            <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs p-1 rounded truncate">
                              {image.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Ad Configurator Sidebar */}
        {showAdConfigurator && (
          <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
            <div className="w-full max-w-lg h-full bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 overflow-y-auto">
              <div className="backdrop-blur-xl bg-white/10 border-l border-white/20 h-full">
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Create Advertisement</h2>
                    <button 
                      onClick={() => setShowAdConfigurator(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-white" />
                    </button>
                  </div>
                  
                  {/* Vehicle Selection */}
                  <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3">Select Vehicle</h3>
                    <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option className="bg-gray-800">2023 BMW X3 - 459,000 SEK</option>
                      <option className="bg-gray-800">2024 Audi A4 - 523,000 SEK</option>
                      <option className="bg-gray-800">2024 Volvo XC90 - 675,000 SEK</option>
                    </select>
                  </div>
                  
                  {/* Ad Content */}
                  <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3">Ad Content</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">Title</label>
                        <input
                          type="text"
                          value={adConfig.title}
                          onChange={(e) => setAdConfig(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">Description</label>
                        <textarea
                          value={adConfig.description}
                          onChange={(e) => setAdConfig(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">Price</label>
                        <input
                          type="text"
                          value={adConfig.price}
                          onChange={(e) => setAdConfig(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Publishing Channels */}
                  <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3">Publishing Channels</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'facebook', name: 'Facebook Marketplace', icon: Facebook, color: 'text-blue-400' },
                        { key: 'instagram', name: 'Instagram Stories', icon: Instagram, color: 'text-pink-400' },
                        { key: 'blocket', name: 'Blocket.se', icon: Globe, color: 'text-green-400' },
                        { key: 'autotrader', name: 'AutoTrader', icon: Car, color: 'text-orange-400' }
                      ].map(({ key, name, icon: Icon, color }) => (
                        <label key={key} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={adConfig.channels[key]}
                            onChange={(e) => setAdConfig(prev => ({
                              ...prev,
                              channels: { ...prev.channels, [key]: e.target.checked }
                            }))}
                            className="rounded"
                          />
                          <Icon size={18} className={color} />
                          <span className="text-white text-sm">{name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Design Options */}
                  <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3">Design Template</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'modern', name: 'Modern', preview: 'bg-gradient-to-r from-blue-500 to-purple-600' },
                        { id: 'classic', name: 'Classic', preview: 'bg-gradient-to-r from-gray-700 to-gray-900' },
                        { id: 'luxury', name: 'Luxury', preview: 'bg-gradient-to-r from-yellow-600 to-orange-600' },
                        { id: 'minimal', name: 'Minimal', preview: 'bg-gradient-to-r from-green-500 to-teal-600' }
                      ].map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setAdConfig(prev => ({ ...prev, template: template.id }))}
                          className={`p-3 rounded-lg border transition-all ${
                            adConfig.template === template.id
                              ? 'border-blue-400 bg-blue-500/20'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <div className={`w-full h-8 rounded ${template.preview} mb-2`}></div>
                          <span className="text-white text-xs">{template.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Preview & Publish */}
                  <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3">Preview</h3>
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                      <div className="text-white font-semibold text-sm mb-2">{adConfig.title}</div>
                      <div className="text-white/70 text-xs mb-2">{adConfig.description}</div>
                      <div className="text-green-400 font-bold text-sm">{adConfig.price}</div>
                    </div>
                    
                    <div className="space-y-3">
                      <button 
                        onClick={createAd}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2"
                      >
                        <Send size={18} />
                        <span>Publish Advertisement</span>
                      </button>
                      <button className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all flex items-center justify-center space-x-2">
                        <Eye size={16} />
                        <span>Preview All Channels</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 3D Vehicle Viewer Modal */}
        {show3DModal && selectedVehicleFor3D && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                    <Maximize2 size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      3D Vehicle Viewer
                    </h2>
                    <p className="text-white/70">
                      {selectedVehicleFor3D.year} {selectedVehicleFor3D.make} {selectedVehicleFor3D.model}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShow3DModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
              
              <div className="p-6">
                <VehicleViewer3D 
                  vehicleData={{
                    make: selectedVehicleFor3D.make,
                    model: selectedVehicleFor3D.model,
                    year: selectedVehicleFor3D.year,
                    color: selectedVehicleFor3D.color
                  }}
                  className="h-[600px] w-full"
                />
              </div>
              
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">${selectedVehicleFor3D.price.toLocaleString()}</div>
                    <div className="text-white/60 text-sm">Current Price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{selectedVehicleFor3D.mileage.toLocaleString()} mi</div>
                    <div className="text-white/60 text-sm">Mileage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{selectedVehicleFor3D.status}</div>
                    <div className="text-white/60 text-sm">Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}