import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSales } from '@/contexts/SalesContext';
import { useLeads } from '@/contexts/LeadsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

type PerformanceMetricsProps = {
  timeRange: 'weekly' | 'monthly' | 'quarterly';
};

export function PerformanceMetrics({ timeRange }: PerformanceMetricsProps) {
  // helper to get period start
  const getStartDate = (): Date => {
    const now = new Date();
    const d = new Date(now);
    if (timeRange === 'weekly') d.setDate(now.getDate() - 6);
    else if (timeRange === 'monthly') d.setMonth(now.getMonth() - 1);
    else d.setMonth(now.getMonth() - 3);
    return d;
  };

  const { sales } = useSales();
  const { leads } = useLeads();
  const { user } = useAuth();

  const data = useMemo(() => {
    if (!user) return { totalSales: 0, conversionRate: '0%', avgDealSize: 'PKR 0', revenue: 'PKR 0' };
    const start = getStartDate();
    const userSales = sales.filter(s => {
      if (s.employeeId !== user.id) return false;
      const ts = s.deliveryDate || s.createdAt;
      if (!ts) return false;
      return new Date(ts) >= start && (s.status === 'verified' || s.status === 'delivered');
    });
    const userLeads = leads.filter(l => l.employeeId === user.id && new Date(l.createdDate) >= start);

    const totalSales = userSales.length;
    const leadsCount = userLeads.length;
    const revenueNum = userSales.reduce((sum, s) => sum + (s.totalCost || 0), 0);
    const avgDeal = totalSales ? revenueNum / totalSales : 0;
    const conversion = leadsCount ? (totalSales / leadsCount) * 100 : 0;

    const formatCurrency = (num: number) => `PKR ${num.toLocaleString()}`;

    return {
      totalSales,
      conversionRate: `${conversion.toFixed(0)}%`,
      avgDealSize: formatCurrency(Math.round(avgDeal)),
      revenue: formatCurrency(revenueNum)
    };
  }, [sales, leads, user, timeRange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalSales}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.conversionRate}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Avg. Deal Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.avgDealSize}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.revenue}</div>
        </CardContent>
      </Card>
    </div>
  );
}
