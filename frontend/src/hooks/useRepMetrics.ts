import { useMemo } from 'react';
import { createDatePredicate, TimeFrame } from '@/utils/date';
import { useSales } from '@/contexts/SalesContext';
import { useRepSettings } from '@/hooks/use-rep-settings';
import { Sale } from '@/types/sale';

/**
 * Computes KPI metrics for a single sales representative for a given timeframe.
 * The hook recomputes whenever sales, settings or the timeframe change – giving us a reactive
 * data source to power real-time dashboards without polling.
 */
export const useRepMetrics = (
  employeeId: string,
  timeframe: 'weekly' | 'monthly' | 'yearly' = 'monthly',
) => {
  const { sales } = useSales();
  const settings = useRepSettings(employeeId);

  return useMemo(() => {
    // 1) Filter sales by employee & verification status
    const employeeSales: Sale[] = sales.filter(
      s => s.employeeId === employeeId && s.status === 'verified',
    );

    // 2) Timeframe predicate
    const datePred = createDatePredicate(timeframe as TimeFrame);
    const tfSales = employeeSales.filter(s => datePred(new Date(s.createdAt)));

    // 3) Revenue & commission
    const revenue = tfSales.reduce((acc, s) => acc + s.totalCost, 0);
    const commission = revenue * 0.1; // 10% flat rate for now

    // 4) Targets based on settings
    let target: number;
    switch (timeframe) {
      case 'weekly':
        target = settings.weeklyRevenueTarget;
        break;
      case 'monthly':
        target = settings.monthlyRevenueTarget;
        break;
      case 'yearly':
        target = settings.yearlyRevenueTarget;
        break;
    }

    const progressPercent = target ? Math.min((revenue / target) * 100, 100) : 0;

    // 5) Small line-chart series (date vs revenue cumulative)
    const lineSeries = tfSales
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(s => ({
        date: new Date(s.createdAt).toLocaleDateString(),
        revenue: s.totalCost,
      }));

    return {
      sales: tfSales,
      revenue,
      commission,
      target,
      progressPercent,
      lineSeries,
    };
  }, [sales, employeeId, timeframe, settings]);
};
