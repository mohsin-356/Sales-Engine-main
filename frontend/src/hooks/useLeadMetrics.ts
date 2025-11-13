import { useLeads } from '@/contexts/LeadsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useMemo } from 'react';
import { isSameDay, isSameMonth } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Computes lead KPIs and progress toward daily & monthly targets.
 */
export const useLeadMetrics = () => {
  const { leads } = useLeads();
  const { user } = useAuth();
  const { settings } = useSettings();

  return useMemo(() => {
    const today = new Date();

    // Scope to current user if not admin
    const scoped = (user && user.role !== 'admin')
      ? leads.filter(l => String(l.employeeId) === String(user.id))
      : leads;

    const safeDate = (d?: string) => d ? new Date(d) : new Date(0);
    const todayLeads = scoped.filter(l => isSameDay(safeDate(l.createdDate), today));
    const monthLeads = scoped.filter(l => isSameMonth(safeDate(l.createdDate), today));

    const statusCount = {
      new: monthLeads.filter(l => l.status === 'new').length,
      contacted: monthLeads.filter(l => l.status === 'contacted').length,
      proposal: monthLeads.filter(l => l.status === 'proposal').length,
      negotiation: monthLeads.filter(l => l.status === 'negotiation').length,
      won: monthLeads.filter(l => l.status === 'won').length,
      lost: monthLeads.filter(l => l.status === 'lost').length,
    };

    const dailyProgress = Math.min((todayLeads.length / settings.dailyLeadTarget) * 100, 100);
    const monthlyProgress = Math.min((monthLeads.length / settings.monthlyLeadTarget) * 100, 100);

    return {
      todayLeads: todayLeads.length,
      monthLeads: monthLeads.length,
      dailyTarget: settings.dailyLeadTarget,
      monthlyTarget: settings.monthlyLeadTarget,
      dailyProgress,
      monthlyProgress,
      statusCount,
    };
  }, [leads, settings, user]);
};
