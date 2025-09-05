import React, { useState } from 'react';
import { useAccount } from '@/contexts/account-context';
import { ChevronDown, Building2, MapPin, Crown, Users, Activity, Zap } from 'lucide-react';

export default function AccountSelector() {
  const { currentAccount, availableAccounts, setCurrentAccount, isManagerView, toggleManagerView } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentAccount) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-yellow-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'text-purple-400';
      case 'pro': return 'text-blue-400';
      case 'basic': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'enterprise': return <Crown size={14} />;
      case 'pro': return <Zap size={14} />;
      case 'basic': return <Activity size={14} />;
      default: return <Activity size={14} />;
    }
  };

  const handleAccountSwitch = (account: any) => {
    setCurrentAccount(account);
    setIsOpen(false);
  };

  // Get accounts to show in dropdown - show all available accounts for now
  // Remove duplicates by id and show all dealers
  const uniqueAccounts = availableAccounts.filter((account, index, self) => 
    index === self.findIndex(a => a.id === account.id)
  );
  const accountsToShow = uniqueAccounts;

  return (
    <div className="relative z-50">
      {/* Current Account Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl transition-all duration-200 min-w-[280px]"
      >
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              {currentAccount.type === 'mother' ? (
                <Building2 size={16} className="text-white" />
              ) : (
                <MapPin size={16} className="text-white" />
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(currentAccount.status)} border border-white`}></div>
          </div>
          
          <div className="flex-1 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium text-sm truncate max-w-[140px]">
                {currentAccount.name}
              </span>
              {currentAccount.type === 'mother' && (
                <Crown size={12} className="text-yellow-400" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className={`flex items-center space-x-1 ${getPlanColor(currentAccount.plan)}`}>
                {getPlanIcon(currentAccount.plan)}
                <span className="capitalize">{currentAccount.plan}</span>
              </span>
              {isManagerView && currentAccount.type === 'mother' && (
                <span className="text-purple-400">• Manager View</span>
              )}
            </div>
          </div>
        </div>
        
        <ChevronDown 
          size={16} 
          className={`text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-[9999] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-white/70" />
                <span className="text-white font-medium">Switch Account</span>
              </div>
            </div>

            {/* Account List */}
            <div className="max-h-80 overflow-y-auto">
              {accountsToShow.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleAccountSwitch(account)}
                  className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-white/10 transition-colors ${
                    account.id === currentAccount.id ? 'bg-blue-500/20' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      {account.type === 'mother' ? (
                        <Building2 size={18} className="text-white" />
                      ) : (
                        <MapPin size={18} className="text-white" />
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(account.status)} border border-white`}></div>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium text-sm">
                        {account.name}
                      </span>
                      {account.type === 'mother' && (
                        <Crown size={12} className="text-yellow-400" />
                      )}
                      {account.id === currentAccount.id && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Current</span>
                      )}
                    </div>
                    <div className="text-white/60 text-xs">{account.location}</div>
                    <div className="flex items-center space-x-3 mt-1 text-xs">
                      <span className={`flex items-center space-x-1 ${getPlanColor(account.plan)}`}>
                        {getPlanIcon(account.plan)}
                        <span className="capitalize">{account.plan}</span>
                      </span>
                      <span className="text-green-400">
                        ${(account.monthlyRevenue / 1000000).toFixed(1)}M/mo
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Manager View Toggle (only for mother accounts) */}
            {currentAccount.type === 'mother' && (
              <div className="border-t border-white/10 p-4">
                <button
                  onClick={() => {
                    toggleManagerView();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Building2 size={16} className="text-purple-400" />
                    <span className="text-white text-sm">Manager View</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors ${
                    isManagerView ? 'bg-purple-500' : 'bg-white/20'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                      isManagerView ? 'translate-x-5' : 'translate-x-1'
                    }`}></div>
                  </div>
                </button>
                <p className="text-white/60 text-xs mt-2">
                  Toggle between individual dealership view and multi-account overview
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}