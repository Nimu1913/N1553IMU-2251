import { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.vehicles': 'Vehicles',
    'nav.appointments': 'Appointments',
    'nav.leads': 'Leads',
    'nav.aiStudio': 'AI Studio',
    'nav.blocket': 'Blocket',
    'nav.marketing': 'Marketing',
    'nav.communications': 'Communications',
    'nav.deals': 'Deals',
    'nav.settings': 'Settings',
    'nav.support': 'Support',
    
    // Dashboard
    'dashboard.title': 'Dashboard Overview',
    'dashboard.subtitle': 'Monitor your dealership performance',
    'dashboard.totalSales': 'Total Sales',
    'dashboard.activeLead': 'Active Leads',
    'dashboard.appointments': 'Appointments',
    'dashboard.vehiclesInStock': 'Vehicles in Stock',
    
    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.add': 'Add New',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.metrics': 'Metrics & KPIs',
    'settings.currency': 'Currency',
  },
  sv: {
    // Navigation
    'nav.dashboard': 'Översikt',
    'nav.vehicles': 'Fordon',
    'nav.appointments': 'Möten',
    'nav.leads': 'Leads',
    'nav.aiStudio': 'AI Studio',
    'nav.blocket': 'Blocket',
    'nav.marketing': 'Marknadsföring',
    'nav.communications': 'Kommunikation',
    'nav.deals': 'Affärer',
    'nav.settings': 'Inställningar',
    'nav.support': 'Support',
    
    // Dashboard
    'dashboard.title': 'Översikt',
    'dashboard.subtitle': 'Övervaka din bilhandels prestanda',
    'dashboard.totalSales': 'Total Försäljning',
    'dashboard.activeLead': 'Aktiva Leads',
    'dashboard.appointments': 'Möten',
    'dashboard.vehiclesInStock': 'Fordon i Lager',
    
    // Common
    'common.search': 'Sök',
    'common.filter': 'Filter',
    'common.add': 'Lägg till ny',
    'common.edit': 'Redigera',
    'common.delete': 'Ta bort',
    'common.save': 'Spara',
    'common.cancel': 'Avbryt',
    
    // Settings
    'settings.title': 'Inställningar',
    'settings.language': 'Språk',
    'settings.metrics': 'Mätvärden & KPI:er',
    'settings.currency': 'Valuta',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<string>('en');
  
  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}