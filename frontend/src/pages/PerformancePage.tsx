import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { KPICard } from '@/components/ui/kpi-card';
import TimeFrameFilter, { TimeFrameFilterValue } from '@/components/ui/timeframe-filter';
import { createDatePredicate } from '@/utils/date';
import { TrendingUp, DollarSign, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { calculateCommission } from '@/utils/commission';
import { api } from '@/lib/api';

/**
 * PerformancePage
 *
 * Generic performance analytics page for non-admin users (executives / representatives).
 * Will be expanded with target-vs-achieved charts and timeframe filters.
 */
export default function PerformancePage() {
  const { user } = useAuth();
  const [tfFilter, setTfFilter] = useState<TimeFrameFilterValue>({ timeframe: 'daily' });
  const [kpisData, setKpisData] = useState<{ totalSales: number; revenue: number; verifiedCount: number; verifiedRevenue?: number } | null>(null);
  const [series, setSeries] = useState<Array<{ d: string; cnt: number; amount: number }>>([]);
  const [loading, setLoading] = useState(false);

  const rangeDates = useMemo(() => {
    if (tfFilter.timeframe === 'custom' && tfFilter.customStart && tfFilter.customEnd) {
      return { from: new Date(tfFilter.customStart), to: new Date(tfFilter.customEnd) };
    }
    const now = new Date();
    if (tfFilter.timeframe === 'weekly') {
      const from = new Date();
      from.setDate(now.getDate() - 6);
      return { from, to: now };
    }
    if (tfFilter.timeframe === 'monthly') {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: now };
    }
    // daily default
    return { from: now, to: now };
  }, [tfFilter]);

  useEffect(() => {
    const fetchPerf = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (user.role !== 'admin') params.set('userId', String(user.id));
        if (rangeDates.from) params.set('from', rangeDates.from.toISOString().slice(0, 10));
        if (rangeDates.to) params.set('to', rangeDates.to.toISOString().slice(0, 10));
        const k = await api.get(`/performance/kpis?${params.toString()}`);
        const s = await api.get(`/performance/series?${params.toString()}`);
        setKpisData({
          totalSales: Number(k?.totalSales || 0),
          revenue: Number(k?.revenue || 0),
          verifiedCount: Number(k?.verifiedCount || 0),
          verifiedRevenue: Number(k?.verifiedRevenue || 0),
        });
        setSeries(s?.points || []);
      } finally { setLoading(false); }
    };
    fetchPerf();
  }, [user, rangeDates]);

  const growthRate = useMemo(() => {
    if (!series || series.length < 2) return 0;
    const last = series[series.length - 1];
    const prev = series[series.length - 2];
    const base = Number(prev.amount || 0) || 0;
    const diff = Number(last.amount || 0) - base;
    return base === 0 ? (diff > 0 ? 100 : 0) : (diff / base) * 100;
  }, [series]);

  // Commission rough estimate from verified revenue (can be refined later)
  const commissionTotal = useMemo(() => {
    const amt = Number(kpisData?.verifiedRevenue || 0);
    const { commission } = calculateCommission({ projectAmount: amt, advanceAmount: 0 });
    return commission;
  }, [kpisData]);

  const totalSales = Number(kpisData?.totalSales || 0);
  const revenue = Number(kpisData?.revenue || 0);
  const avgDeal = totalSales ? revenue / totalSales : 0;

  const kpis = [
    {
      title: 'Total Sales (YTD)',
      value: totalSales,
      changeType: 'neutral' as const,
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      title: 'Revenue (YTD)',
      value: `PKR ${revenue.toLocaleString()}`,
      changeType: 'neutral' as const,
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: 'Commission (Payroll Rules)',
      value: `PKR ${commissionTotal.toLocaleString()}`,
      changeType: 'neutral' as const,
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: 'Avg. Deal Size',
      value: `PKR ${avgDeal.toLocaleString()}`,
      changeType: 'neutral' as const,
      icon: <Eye className="h-4 w-4" />,
    },
  ];
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Performance Analytics</h1>
        <TimeFrameFilter value={tfFilter} onChange={setTfFilter} />
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Placeholder for further visualisations */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Charts and tables coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
