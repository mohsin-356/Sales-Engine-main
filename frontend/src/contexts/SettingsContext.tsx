import { createContext, useContext, useState, ReactNode } from 'react';
import { CompanySettings } from '@/types';

interface SettingsContextType {
  settings: CompanySettings;
  updateSettings: (updates: Partial<CompanySettings>) => void;
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: CompanySettings = {
  baseSalary: 30000,
  salesTarget: 12,
  revenueTarget: 400000,
  weeklyRevenueTarget: 100000,
  monthlyRevenueTarget: 500000,
  yearlyRevenueTarget: 4800000,
  dailyLeadTarget: 8,
  monthlyLeadTarget: 200,
  projectBonusThreshold: 50000,
  projectBonusRate: 0.05,
  deductionPerMissedSale: 4000,
  tieredBonusRates: {
    tier1: { min: 13, max: 15, amount: 2000 },
    tier2: { min: 16, max: 20, amount: 3000 },
    tier3: { min: 21, max: 25, amount: 4000 },
    tier4: { min: 26, amount: 6000 }
  },
  paymentSchedule: 'Paid between 1st and 7th of next month',
  workingHours: '9:00 AM – 6:00 PM, Monday–Saturday (Fridays off)'
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<CompanySettings>(() => {
  try {
    const stored = localStorage.getItem('companySettings');
    if (stored) {
      return JSON.parse(stored) as CompanySettings;
    }
  } catch {
    // ignore parse errors
  }
  return defaultSettings;
});

  const updateSettings = (updates: Partial<CompanySettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates } as CompanySettings;
      try {
        localStorage.setItem('companySettings', JSON.stringify(newSettings));
      } catch {}
      return newSettings;
    });
  };

  const resetToDefaults = () => {
    try { localStorage.removeItem('companySettings'); } catch {}
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      resetToDefaults
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};