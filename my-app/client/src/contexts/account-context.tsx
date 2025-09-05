import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// API Types
interface Dealer {
  id: string;
  name: string;
  type: 'network' | 'independent';
  city: string;
  region: string;
  phone: string;
  email: string;
  employeeCount: number;
  monthlyRevenue: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'basic' | 'pro' | 'enterprise';
  specializations: string[];
  brands: string[];
  networkId: string | null;
  network?: {
    id: string;
    name: string;
    type: string;
  };
  stats?: {
    totalUsers: number;
    totalVehicles: number;
    availableVehicles: number;
  };
}

interface DealerNetwork {
  id: string;
  name: string;
  type: string;
  headquarters: string;
  established: number;
  totalDealerships: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'mother' | 'child';
  dealershipName: string;
  location: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'basic' | 'pro' | 'enterprise';
  monthlyRevenue: number;
  vehicleCount: number;
  leadCount: number;
  lastActive: string;
  parentId?: string;
  children?: Account[];
  logoUrl?: string;
  contactEmail: string;
  phone: string;
  address: string;
}

// API Service Functions
const API_BASE_URL = 'http://localhost:3000/api';

const dealerService = {
  async getAllDealers(): Promise<Dealer[]> {
    const response = await fetch(`${API_BASE_URL}/dealers`);
    if (!response.ok) throw new Error('Failed to fetch dealers');
    const data = await response.json();
    return data.data;
  },

  async getDealerNetworks(): Promise<DealerNetwork[]> {
    const response = await fetch(`${API_BASE_URL}/dealers/networks`);
    if (!response.ok) throw new Error('Failed to fetch networks');
    const data = await response.json();
    return data.data;
  },

  async getDealerById(id: string): Promise<Dealer> {
    const response = await fetch(`${API_BASE_URL}/dealers/${id}`);
    if (!response.ok) throw new Error('Failed to fetch dealer');
    const data = await response.json();
    return data.data;
  },

  async switchAccount(dealerId: string, userId?: string) {
    const response = await fetch(`${API_BASE_URL}/dealers/switch-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealerId, userId })
    });
    if (!response.ok) throw new Error('Failed to switch account');
    const data = await response.json();
    return data.data;
  }
};

interface AccountContextType {
  currentAccount: Account | null;
  availableAccounts: Account[];
  isManagerView: boolean;
  setCurrentAccount: (account: Account) => void;
  toggleManagerView: () => void;
  getChildAccounts: (parentId: string) => Account[];
  getTotalMetrics: () => {
    totalRevenue: number;
    totalVehicles: number;
    totalLeads: number;
    activeAccounts: number;
  };
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// Convert dealer data to account format
const convertDealerToAccount = (dealer: any): Account => {
  // Handle both old format (dealer.name) and new format (dealer.dealershipName)
  const dealershipName = dealer.dealershipName || dealer.name;
  const location = dealer.location || `${dealer.city || 'Unknown'}, ${dealer.region || 'Sweden'}`;
  
  return {
    id: dealer.id,
    name: dealershipName,
    type: dealer.type === 'mother' ? 'mother' : 'child',
    dealershipName: dealershipName,
    location: location,
    status: dealer.status || 'active',
    plan: dealer.plan || 'basic',
    monthlyRevenue: dealer.monthlyRevenue || parseFloat(dealer.monthlyRevenue) || 0,
    vehicleCount: dealer.vehicleCount || dealer.stats?.totalVehicles || 0,
    leadCount: dealer.leadCount || 0,
    lastActive: new Date().toISOString(),
    contactEmail: dealer.email || 'info@dealership.se',
    phone: dealer.phone || '+46 8 000 0000',
    address: location,
    parentId: dealer.parentNetwork || dealer.networkId,
    logoUrl: `/logos/${dealer.id}.png`
  };
};

// Convert network data to mother account format
const convertNetworkToAccount = (network: DealerNetwork, dealers: Dealer[]): Account => {
  const networkDealers = dealers.filter(d => d.networkId === network.id);
  const totalRevenue = networkDealers.reduce((sum, dealer) => sum + (parseFloat(dealer.monthlyRevenue) || 0), 0);
  const totalVehicles = networkDealers.reduce((sum, dealer) => sum + (dealer.stats?.totalVehicles || 0), 0);
  
  return {
    id: network.id,
    name: network.name,
    type: 'mother',
    dealershipName: `${network.name} Network`,
    location: network.headquarters,
    status: 'active',
    plan: 'enterprise',
    monthlyRevenue: totalRevenue,
    vehicleCount: totalVehicles,
    leadCount: 0, // Will be calculated from child accounts
    lastActive: new Date().toISOString(),
    contactEmail: `info@${network.name.toLowerCase().replace(/\s+/g, '')}.se`,
    phone: '+46 8 000 0000',
    address: network.headquarters,
    logoUrl: `/logos/${network.id}.png`
  };
};

interface AccountProviderProps {
  children: ReactNode;
}

export function AccountProvider({ children }: AccountProviderProps) {
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [isManagerView, setIsManagerView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load accounts from API
  useEffect(() => {
    async function loadAccounts() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dealers - the API already includes mother accounts
        const dealers = await dealerService.getAllDealers();

        const accounts: Account[] = [];
        
        // Convert all dealer accounts (includes mother accounts with type="mother")
        dealers.forEach(dealer => {
          accounts.push(convertDealerToAccount(dealer));
        });

        setAvailableAccounts(accounts);
        
        // Initialize with first mother account
        const motherAccount = accounts.find(acc => acc.type === 'mother');
        if (motherAccount) {
          setCurrentAccount(motherAccount);
          setIsManagerView(true);
        }
      } catch (err) {
        console.error('Failed to load accounts:', err);
        setError('Failed to load account data');
        
        // Fallback to demo account
        const demoAccount: Account = {
          id: 'demo',
          name: 'TESTRIDE Demo',
          type: 'mother',
          dealershipName: 'TESTRIDE Stockholm Central',
          location: 'Stockholm, Sweden',
          status: 'active',
          plan: 'enterprise',
          monthlyRevenue: 2650000,
          vehicleCount: 25,
          leadCount: 15,
          lastActive: new Date().toISOString(),
          contactEmail: 'demo@testride.se',
          phone: '+46 8 123 4567',
          address: 'Stockholm, Sweden'
        };
        setAvailableAccounts([demoAccount]);
        setCurrentAccount(demoAccount);
        setIsManagerView(true);
      } finally {
        setLoading(false);
      }
    }

    loadAccounts();
  }, []);

  const handleSetCurrentAccount = async (account: Account) => {
    try {
      // Call API to switch account if needed
      if (account.id !== currentAccount?.id) {
        await dealerService.switchAccount(account.id);
      }
      
      setCurrentAccount(account);
      // Automatically switch to manager view if selecting mother account
      if (account.type === 'mother') {
        setIsManagerView(true);
      } else {
        setIsManagerView(false);
      }
    } catch (err) {
      console.error('Failed to switch account:', err);
      // Still update the UI, API call may have failed but we can continue
      setCurrentAccount(account);
    }
  };

  const toggleManagerView = () => {
    // Only allow manager view for mother accounts
    if (currentAccount?.type === 'mother') {
      setIsManagerView(!isManagerView);
    }
  };

  const getChildAccounts = (parentId: string): Account[] => {
    return availableAccounts.filter(account => account.parentId === parentId);
  };

  const getTotalMetrics = () => {
    const childAccounts = currentAccount?.type === 'mother' 
      ? getChildAccounts(currentAccount.id)
      : [];

    return {
      totalRevenue: childAccounts.reduce((sum, acc) => sum + acc.monthlyRevenue, 0),
      totalVehicles: childAccounts.reduce((sum, acc) => sum + acc.vehicleCount, 0),
      totalLeads: childAccounts.reduce((sum, acc) => sum + acc.leadCount, 0),
      activeAccounts: childAccounts.filter(acc => acc.status === 'active').length
    };
  };

  // Show loading state
  if (loading) {
    return (
      <AccountContext.Provider
        value={{
          currentAccount: null,
          availableAccounts: [],
          isManagerView: false,
          setCurrentAccount: () => {},
          toggleManagerView: () => {},
          getChildAccounts: () => [],
          getTotalMetrics: () => ({ totalRevenue: 0, totalVehicles: 0, totalLeads: 0, activeAccounts: 0 })
        }}
      >
        {children}
      </AccountContext.Provider>
    );
  }

  return (
    <AccountContext.Provider
      value={{
        currentAccount,
        availableAccounts,
        isManagerView,
        setCurrentAccount: handleSetCurrentAccount,
        toggleManagerView,
        getChildAccounts,
        getTotalMetrics
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}