import React, { useState } from 'react';
import { useAccount } from '@/contexts/account-context';
import { 
  Building2, 
  TrendingUp, 
  Car, 
  Users, 
  DollarSign, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Crown,
  Zap
} from 'lucide-react';
import SalesAnalytics3D from '@/components/3d/SalesAnalytics3D';

export default function ManagerOverview() {
  const { currentAccount, getChildAccounts, getTotalMetrics } = useAccount();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  
  if (!currentAccount || currentAccount.type !== 'mother') {
    return null;
  }

  const childAccounts = getChildAccounts(currentAccount.id);
  const totalMetrics = getTotalMetrics();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-yellow-400';
      case 'suspended': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'inactive': return <Activity size={16} />;
      case 'suspended': return <AlertTriangle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'enterprise': return <Crown size={16} className="text-purple-400" />;
      case 'pro': return <Zap size={16} className="text-blue-400" />;
      case 'basic': return <Activity size={16} className="text-green-400" />;
      default: return <Activity size={16} />;
    }
  };

  const overviewStats = [
    {
      label: 'Total Network Revenue',
      value: `$${(totalMetrics.totalRevenue / 1000000).toFixed(1)}M`,
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Active Locations',
      value: totalMetrics.activeAccounts.toString(),
      change: '100%',
      trend: 'up' as const,
      icon: Building2,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      label: 'Total Vehicles',
      value: totalMetrics.totalVehicles.toString(),
      change: '+8.3%',
      trend: 'up' as const,
      icon: Car,
      color: 'from-purple-500 to-violet-600'
    },
    {
      label: 'Network Leads',
      value: totalMetrics.totalLeads.toString(),
      change: '+15.2%',
      trend: 'up' as const,
      icon: Users,
      color: 'from-orange-500 to-red-600'
    }
  ];

  // Generate realistic alerts based on actual dealer data
  const generateRecentAlerts = () => {
    const alerts = [];
    const now = new Date();
    
    childAccounts.forEach((account, index) => {
      // Low inventory alert
      if (account.vehicleCount < 5) {
        alerts.push({
          type: 'warning',
          location: account.dealershipName,
          message: `Low inventory - only ${account.vehicleCount} vehicles remaining`,
          time: `${Math.floor(Math.random() * 8) + 1} hours ago`,
          priority: 'high'
        });
      }
      
      // High lead activity
      if (account.leadCount > 20) {
        alerts.push({
          type: 'success',
          location: account.dealershipName,
          message: `High lead activity - ${account.leadCount} active leads`,
          time: `${Math.floor(Math.random() * 12) + 1} hours ago`,
          priority: 'low'
        });
      }
      
      // Status-based alerts
      if (account.status === 'inactive') {
        alerts.push({
          type: 'error',
          location: account.dealershipName,
          message: 'Dealership marked as inactive',
          time: `${Math.floor(Math.random() * 24) + 1} hours ago`,
          priority: 'high'
        });
      }
      
      // Revenue-based alerts
      if (account.monthlyRevenue > 2000000) {
        alerts.push({
          type: 'success',
          location: account.dealershipName,
          message: 'Exceptional monthly revenue performance',
          time: `${Math.floor(Math.random() * 6) + 1} hours ago`,
          priority: 'low'
        });
      }
    });
    
    // Sort by priority and time, return top 6
    return alerts
      .sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 6);
  };
  
  const recentAlerts = generateRecentAlerts();

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20';
      case 'success': return 'text-green-400 bg-green-500/20';
      case 'info': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {overviewStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 lg:p-6 shadow-2xl hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className={`p-2 lg:p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <IconComponent size={20} className="text-white lg:w-6 lg:h-6" />
                </div>
                <div className={`flex items-center space-x-1 text-xs lg:text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-500'
                }`}>
                  <TrendingUp size={14} className={`lg:w-4 lg:h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xl lg:text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-white/70 text-xs lg:text-sm">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Location Performance */}
        <div className="lg:col-span-2">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Location Performance</h2>
              <div className="flex space-x-2">
                {(['week', 'month', 'quarter'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      selectedPeriod === period
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              {childAccounts.map((account) => {
                const availableVehicles = Math.floor(account.vehicleCount * 0.8); // Estimate 80% available
                
                return (
                  <div key={account.id} className="flex items-center space-x-4 p-4 hover:bg-white/10 rounded-lg transition-colors">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <MapPin size={20} className="text-white" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${account.status === 'active' ? 'bg-green-500' : account.status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'} border-2 border-white`}></div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-medium">{account.name}</h3>
                        {getPlanIcon(account.plan)}
                        <span className={`flex items-center space-x-1 text-xs ${getStatusColor(account.status)}`}>
                          {getStatusIcon(account.status)}
                          <span className="capitalize">{account.status}</span>
                        </span>
                      </div>
                      <p className="text-white/60 text-sm">{account.location}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs">
                        <span className="text-green-400">{(account.monthlyRevenue / 1000).toLocaleString()}K SEK/mo</span>
                        <span className="text-blue-400">{account.vehicleCount} vehicles ({availableVehicles} available)</span>
                        <span className="text-orange-400">{account.leadCount} leads</span>
                      </div>
                      <div className="flex items-center space-x-3 mt-2 text-xs">
                        <span className="text-purple-400">{account.status}</span>
                        <span className="text-cyan-400">{account.plan} plan</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                        <Phone size={14} className="text-white/60" />
                      </button>
                      <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                        <Mail size={14} className="text-white/60" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="space-y-6">
          {/* 3D Analytics */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Network Analytics</h3>
              <Activity size={16} className="text-blue-400" />
            </div>
            <SalesAnalytics3D className="h-[300px] w-full" />
          </div>

          {/* Recent Alerts */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
              <AlertTriangle size={18} className="text-yellow-400" />
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentAlerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getAlertColor(alert.type)} border-current/20`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${alert.type === 'error' ? 'bg-red-400' : alert.type === 'warning' ? 'bg-yellow-400' : alert.type === 'success' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/90 font-medium text-sm">{alert.location}</span>
                        <span className="text-white/60 text-xs">{alert.time}</span>
                      </div>
                      <p className="text-white/80 text-sm">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
              View All Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}