import { CompanySettings } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * Returns the effective settings for a given user ID, merging any
 * per-rep overrides with the company defaults.
 */
export const useRepSettings = (userId?: string): CompanySettings => {
  const { users } = useAuth();
  const { settings: company } = useSettings();

  if (!userId) return company;

  const user = users.find((u) => u.id === userId);
  if (user && user.settingsOverride) {
    return { ...company, ...user.settingsOverride } as CompanySettings;
  }

  return company;
};
