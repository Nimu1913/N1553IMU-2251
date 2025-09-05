import { createContext, useContext, useState, ReactNode } from 'react';

export interface MetricConfig {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  type: 'currency' | 'number' | 'percentage';
  visible: boolean;
  order: number;
}

interface MetricsContextType {
  metrics: MetricConfig[];
  updateMetric: (id: string, updates: Partial<MetricConfig>) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
}

const defaultMetrics: MetricConfig[] = [
  {
    id: 'totalSales',
    name: 'Total Sales',
    value: 2450000,
    unit: 'SEK',
    type: 'currency',
    visible: true,
    order: 1,
  },
  {
    id: 'activeLeads',
    name: 'Active Leads',
    value: 127,
    unit: '',
    type: 'number',
    visible: true,
    order: 2,
  },
  {
    id: 'appointments',
    name: 'Appointments',
    value: 23,
    unit: '',
    type: 'number',
    visible: true,
    order: 3,
  },
  {
    id: 'vehiclesInStock',
    name: 'Vehicles in Stock',
    value: 89,
    unit: '',
    type: 'number',
    visible: true,
    order: 4,
  },
  {
    id: 'conversionRate',
    name: 'Conversion Rate',
    value: 12.5,
    unit: '%',
    type: 'percentage',
    visible: true,
    order: 5,
  },
  {
    id: 'avgDealValue',
    name: 'Average Deal Value',
    value: 385000,
    unit: 'SEK',
    type: 'currency',
    visible: true,
    order: 6,
  },
];

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export function MetricsProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<MetricConfig[]>(defaultMetrics);
  const [currency, setCurrency] = useState<string>('SEK');
  
  const updateMetric = (id: string, updates: Partial<MetricConfig>) => {
    setMetrics(prev => prev.map(metric => 
      metric.id === id ? { ...metric, ...updates } : metric
    ));
  };
  
  const formatCurrency = (value: number): string => {
    const currencySymbols = {
      'SEK': 'kr',
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
    };
    
    const symbol = currencySymbols[currency as keyof typeof currencySymbols] || currency;
    
    if (currency === 'SEK') {
      return `${value.toLocaleString('sv-SE')} ${symbol}`;
    }
    
    return `${symbol}${value.toLocaleString()}`;
  };
  
  const formatNumber = (value: number): string => {
    return value.toLocaleString();
  };
  
  return (
    <MetricsContext.Provider value={{
      metrics,
      updateMetric,
      currency,
      setCurrency,
      formatCurrency,
      formatNumber,
    }}>
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
}