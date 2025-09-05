import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useLanguage } from "@/contexts/language-context";
import { useMetrics, MetricConfig } from "@/contexts/metrics-context";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Settings, User, Bell, Shield, Database, Palette, Globe, Save, Eye, EyeOff, BarChart3, Plus, Edit3, Trash2, Move } from "lucide-react";

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

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
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

  const renderTabContent = () => {
    switch (selectedTab) {
      case "profile":
        return renderProfileTab();
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