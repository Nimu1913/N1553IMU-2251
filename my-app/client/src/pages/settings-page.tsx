import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useLanguage } from "@/contexts/language-context";
import { useMetrics, MetricConfig } from "@/contexts/metrics-context";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Settings, User, Bell, Shield, Database, Palette, Globe, Save, Eye, EyeOff, BarChart3, Plus, Edit3, Trash2, Move, Building2, CreditCard, FileText, Clock, MapPin, Phone } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { metrics, updateMetric, currency, setCurrency, formatCurrency } = useMetrics();
  const [selectedTab, setSelectedTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "John Smith",
    email: user?.email || "john@automax.com",
    phone: "+46 70 123 4567",
    role: user?.role || "Sales Manager",
    dealership: user?.dealership || "AutoMax Stockholm",
    avatar: ""
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    leadAlerts: true,
    appointmentReminders: true,
    systemUpdates: false,
    marketingEmails: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: "30",
    loginAlerts: true
  });

  const [systemSettings, setSystemSettings] = useState({
    language: language,
    timezone: "Europe/Stockholm",
    currency: currency,
    dateFormat: "YYYY-MM-DD",
    theme: "dark",
    autoBackup: true,
    dataRetention: "12"
  });

  const [businessInfo, setBusinessInfo] = useState({
    dealershipName: "AutoMax Stockholm",
    legalName: "AutoMax Stockholm AB",
    vatNumber: "SE556789123401",
    registrationNumber: "556789-1234",
    businessType: "Limited Company",
    establishedYear: "2018",
    website: "https://automax-stockholm.se",
    description: "Premium automotive dealership specializing in luxury and electric vehicles",
    // Address Information
    streetAddress: "Sveavägen 123",
    city: "Stockholm",
    postalCode: "11157",
    country: "Sweden",
    // Contact Information
    mainPhone: "+46 8 123 4567",
    fax: "+46 8 123 4568",
    supportEmail: "support@automax-stockholm.se",
    salesEmail: "sales@automax-stockholm.se",
    // Social Media
    facebook: "https://facebook.com/automaxstockholm",
    instagram: "@automaxstockholm",
    linkedin: "https://linkedin.com/company/automax-stockholm"
  });

  const [complianceInfo, setComplianceInfo] = useState({
    dealerLicense: "DL-2018-0234",
    licenseExpiry: "2025-12-31",
    insuranceProvider: "Trygg-Hansa",
    insurancePolicy: "POL-789456123",
    insuranceExpiry: "2024-08-15",
    certifications: ["ISO 9001", "Authorized BMW Dealer", "Tesla Service Center"],
    taxRegistration: "SE556789123401",
    chamberOfCommerce: "Stockholm Chamber",
    environmentalCert: "Green Business Certified"
  });

  const [operatingInfo, setOperatingInfo] = useState({
    // Operating Hours
    mondayHours: "09:00-18:00",
    tuesdayHours: "09:00-18:00",
    wednesdayHours: "09:00-18:00",
    thursdayHours: "09:00-19:00",
    fridayHours: "09:00-18:00",
    saturdayHours: "10:00-16:00",
    sundayHours: "Closed",
    // Service Information
    serviceTypes: ["Sales", "Service", "Parts", "Financing", "Insurance"],
    languages: ["Swedish", "English", "German"],
    paymentMethods: ["Card", "Bank Transfer", "Financing", "Leasing"],
    deliveryRadius: "50", // km
    // Staff Information
    totalEmployees: "24",
    salesStaff: "8",
    serviceStaff: "12",
    adminStaff: "4"
  });

  const [billingInfo, setBillingInfo] = useState({
    // Subscription
    currentPlan: "Professional",
    planPrice: "2,499 SEK/month",
    billingCycle: "Monthly",
    nextBilling: "2024-02-15",
    // Payment Method
    paymentMethod: "Credit Card",
    cardLast4: "4242",
    cardExpiry: "12/26",
    // Billing Address
    billingName: "AutoMax Stockholm AB",
    billingAddress: "Sveavägen 123",
    billingCity: "Stockholm",
    billingPostal: "11157",
    billingCountry: "Sweden",
    // Usage Stats
    monthlyUsers: "24",
    storageUsed: "2.3 GB",
    apiCalls: "15,234",
    // Billing History
    invoices: [
      { id: "INV-2024-001", date: "2024-01-15", amount: "2,499 SEK", status: "Paid" },
      { id: "INV-2023-012", date: "2023-12-15", amount: "2,499 SEK", status: "Paid" },
      { id: "INV-2023-011", date: "2023-11-15", amount: "2,499 SEK", status: "Paid" }
    ]
  });

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "business", name: "Business Info", icon: Building2 },
    { id: "billing", name: "Billing", icon: CreditCard },
    { id: "compliance", name: "Compliance", icon: FileText },
    { id: "operating", name: "Operations", icon: Clock },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "system", name: "System", icon: Database },
    { id: "metrics", name: "Metrics & KPIs", icon: BarChart3 },
    { id: "appearance", name: "Appearance", icon: Palette }
  ];

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setSystemSettings(prev => ({ ...prev, language: newLanguage }));
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    setSystemSettings(prev => ({ ...prev, currency: newCurrency }));
    // Update all currency-based metrics
    metrics.forEach(metric => {
      if (metric.type === 'currency') {
        updateMetric(metric.id, { unit: newCurrency });
      }
    });
  };

  const handleMetricUpdate = (id: string, updates: Partial<MetricConfig>) => {
    updateMetric(id, updates);
    setEditingMetric(null);
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Role</label>
            <input
              type="text"
              value={profileData.role}
              onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2">
            <Save size={18} />
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Language & Localization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Language</label>
            <select
              value={systemSettings.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en" className="bg-gray-800">English</option>
              <option value="sv" className="bg-gray-800">Svenska</option>
            </select>
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Currency</label>
            <select
              value={systemSettings.currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SEK" className="bg-gray-800">Swedish Krona (SEK)</option>
              <option value="EUR" className="bg-gray-800">Euro (EUR)</option>
              <option value="USD" className="bg-gray-800">US Dollar (USD)</option>
              <option value="GBP" className="bg-gray-800">British Pound (GBP)</option>
            </select>
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Timezone</label>
            <select
              value={systemSettings.timezone}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Europe/Stockholm" className="bg-gray-800">Europe/Stockholm</option>
              <option value="Europe/London" className="bg-gray-800">Europe/London</option>
              <option value="America/New_York" className="bg-gray-800">America/New_York</option>
            </select>
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Date Format</label>
            <select
              value={systemSettings.dateFormat}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="YYYY-MM-DD" className="bg-gray-800">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY" className="bg-gray-800">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY" className="bg-gray-800">MM/DD/YYYY</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Dashboard Metrics & KPIs</h3>
          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center space-x-2">
            <Plus size={18} />
            <span>Add Metric</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {metrics
            .sort((a, b) => a.order - b.order)
            .map((metric) => (
            <div key={metric.id} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <Move size={16} className="text-white/40 cursor-move" />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={metric.visible}
                      onChange={(e) => updateMetric(metric.id, { visible: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-transparent border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-white/60 text-sm">Visible</span>
                  </div>
                  
                  {editingMetric === metric.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="text"
                        value={metric.name}
                        onChange={(e) => updateMetric(metric.id, { name: e.target.value })}
                        className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={metric.value}
                        onChange={(e) => updateMetric(metric.id, { value: Number(e.target.value) })}
                        className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <select
                        value={metric.unit}
                        onChange={(e) => updateMetric(metric.id, { unit: e.target.value })}
                        className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="" className="bg-gray-800">No unit</option>
                        <option value="%" className="bg-gray-800">%</option>
                        <option value="SEK" className="bg-gray-800">SEK</option>
                        <option value="EUR" className="bg-gray-800">EUR</option>
                        <option value="USD" className="bg-gray-800">USD</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between flex-1">
                      <div>
                        <span className="text-white font-medium">{metric.name}</span>
                        <div className="text-white/60 text-sm">
                          {metric.type === 'currency' 
                            ? formatCurrency(Number(metric.value))
                            : `${metric.value}${metric.unit}`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {editingMetric === metric.id ? (
                    <>
                      <button
                        onClick={() => setEditingMetric(null)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Save size={16} className="text-green-400" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingMetric(metric.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} className="text-blue-400" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2">
            <Save size={18} />
            <span>Save Metrics Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderBusinessTab = () => (
    <div className="space-y-6">
      {/* Basic Business Information */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Dealership Name</label>
            <input
              type="text"
              value={businessInfo.dealershipName}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, dealershipName: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Legal Business Name</label>
            <input
              type="text"
              value={businessInfo.legalName}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, legalName: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">VAT Number</label>
            <input
              type="text"
              value={businessInfo.vatNumber}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, vatNumber: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="SE556789123401"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Registration Number</label>
            <input
              type="text"
              value={businessInfo.registrationNumber}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, registrationNumber: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="556789-1234"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-white/70 text-sm font-medium mb-2">Business Description</label>
          <textarea
            value={businessInfo.description}
            onChange={(e) => setBusinessInfo(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your dealership's focus and specialties..."
          />
        </div>
      </div>
      
      {/* Address Information */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Business Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-white/70 text-sm font-medium mb-2">Street Address</label>
            <input
              type="text"
              value={businessInfo.streetAddress}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, streetAddress: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">City</label>
            <input
              type="text"
              value={businessInfo.city}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Postal Code</label>
            <input
              type="text"
              value={businessInfo.postalCode}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, postalCode: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Contact Information */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Main Phone</label>
            <input
              type="tel"
              value={businessInfo.mainPhone}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, mainPhone: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Sales Email</label>
            <input
              type="email"
              value={businessInfo.salesEmail}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, salesEmail: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              value={businessInfo.website}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Support Email</label>
            <input
              type="email"
              value={businessInfo.supportEmail}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, supportEmail: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2">
            <Save size={18} />
            <span>Save Business Information</span>
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderBillingTab = () => (
    <div className="space-y-6">
      {/* Current Subscription */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Current Subscription</h3>
          <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            Active
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{billingInfo.currentPlan}</div>
            <div className="text-white/60 text-sm">Current Plan</div>
          </div>
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{billingInfo.planPrice}</div>
            <div className="text-white/60 text-sm">{billingInfo.billingCycle}</div>
          </div>
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{billingInfo.nextBilling}</div>
            <div className="text-white/60 text-sm">Next Billing Date</div>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-4">
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
            Upgrade Plan
          </button>
          <button className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all">
            Change Billing Cycle
          </button>
        </div>
      </div>
      
      {/* Payment Method */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Payment Method</h3>
        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded flex items-center justify-center">
              <CreditCard size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-medium">**** **** **** {billingInfo.cardLast4}</div>
              <div className="text-white/60 text-sm">Expires {billingInfo.cardExpiry}</div>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
            Update
          </button>
        </div>
      </div>
      
      {/* Usage Statistics */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Usage Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{billingInfo.monthlyUsers}</div>
            <div className="text-white/60 text-sm">Active Users</div>
            <div className="text-xs text-green-400 mt-1">24 user limit</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{billingInfo.storageUsed}</div>
            <div className="text-white/60 text-sm">Storage Used</div>
            <div className="text-xs text-green-400 mt-1">10 GB limit</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{billingInfo.apiCalls}</div>
            <div className="text-white/60 text-sm">API Calls</div>
            <div className="text-xs text-green-400 mt-1">This month</div>
          </div>
        </div>
      </div>
      
      {/* Billing History */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Billing History</h3>
        <div className="space-y-4">
          {billingInfo.invoices.map((invoice, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">{invoice.id}</div>
                  <div className="text-white/60 text-sm">{invoice.date}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-white font-medium">{invoice.amount}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    invoice.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {invoice.status}
                  </div>
                </div>
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderComplianceTab = () => (
    <div className="space-y-6">
      {/* License Information */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Licenses & Certifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Dealer License Number</label>
            <input
              type="text"
              value={complianceInfo.dealerLicense}
              onChange={(e) => setComplianceInfo(prev => ({ ...prev, dealerLicense: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">License Expiry Date</label>
            <input
              type="date"
              value={complianceInfo.licenseExpiry}
              onChange={(e) => setComplianceInfo(prev => ({ ...prev, licenseExpiry: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Insurance Provider</label>
            <input
              type="text"
              value={complianceInfo.insuranceProvider}
              onChange={(e) => setComplianceInfo(prev => ({ ...prev, insuranceProvider: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Insurance Policy Number</label>
            <input
              type="text"
              value={complianceInfo.insurancePolicy}
              onChange={(e) => setComplianceInfo(prev => ({ ...prev, insurancePolicy: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Certifications */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Current Certifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complianceInfo.certifications.map((cert, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <FileText size={14} className="text-white" />
                </div>
                <span className="text-white text-sm">{cert}</span>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2">
            <Plus size={16} />
            <span>Add Certification</span>
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderOperatingTab = () => (
    <div className="space-y-6">
      {/* Operating Hours */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Operating Hours</h3>
        <div className="space-y-4">
          {[
            { day: 'Monday', key: 'mondayHours' },
            { day: 'Tuesday', key: 'tuesdayHours' },
            { day: 'Wednesday', key: 'wednesdayHours' },
            { day: 'Thursday', key: 'thursdayHours' },
            { day: 'Friday', key: 'fridayHours' },
            { day: 'Saturday', key: 'saturdayHours' },
            { day: 'Sunday', key: 'sundayHours' }
          ].map(({ day, key }) => (
            <div key={day} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center space-x-4">
                <Clock size={16} className="text-white/60" />
                <span className="text-white font-medium w-20">{day}</span>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={operatingInfo[key as keyof typeof operatingInfo] as string}
                  onChange={(e) => setOperatingInfo(prev => ({ ...prev, [key]: e.target.value }))}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="09:00-18:00 or Closed"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Services & Capabilities */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Services & Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Services Offered</label>
            <div className="space-y-2">
              {operatingInfo.serviceTypes.map((service, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-white text-sm">{service}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Languages Supported</label>
            <div className="space-y-2">
              {operatingInfo.languages.map((language, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-white text-sm">{language}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Delivery Radius (km)</label>
            <input
              type="number"
              value={operatingInfo.deliveryRadius}
              onChange={(e) => setOperatingInfo(prev => ({ ...prev, deliveryRadius: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Total Employees</label>
            <input
              type="number"
              value={operatingInfo.totalEmployees}
              onChange={(e) => setOperatingInfo(prev => ({ ...prev, totalEmployees: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case "profile":
        return renderProfileTab();
      case "business":
        return renderBusinessTab();
      case "billing":
        return renderBillingTab();
      case "compliance":
        return renderComplianceTab();
      case "operating":
        return renderOperatingTab();
      case "system":
        return renderSystemTab();
      case "metrics":
        return renderMetricsTab();
      case "notifications":
        return <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"><p className="text-white">Notifications settings coming soon...</p></div>;
      case "security":
        return <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"><p className="text-white">Security settings coming soon...</p></div>;
      case "appearance":
        return <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"><p className="text-white">Appearance settings coming soon...</p></div>;
      default:
        return renderProfileTab();
    }
  };

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
              <Settings size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('settings.title')}</h1>
              <p className="text-white/70">Customize your dealership experience</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      selectedTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}