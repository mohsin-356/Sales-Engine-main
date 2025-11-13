import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSales } from '@/contexts/SalesContext';
import { useLeads } from '@/contexts/LeadsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

type AnalyticsChartProps = {
  timeRange: 'weekly' | 'monthly' | 'quarterly';
};

export function AnalyticsChart({ timeRange }: AnalyticsChartProps) {
  const { sales } = useSales();
  const { leads } = useLeads();
  const { user } = useAuth();

  const data = useMemo(() => {
    if (!user) return [] as { name: string; sales: number; leads: number }[];
    const now = new Date();

    const buckets: { name: string; start: Date; end: Date }[] = [];

    if (timeRange === 'weekly') {
      // Last 7 days including today
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        const label = day.toLocaleDateString(undefined, { weekday: 'short' });
        const start = new Date(day); start.setHours(0,0,0,0);
        const end = new Date(day); end.setHours(23,59,59,999);
        buckets.push({ name: label, start, end });
      }
    } else if (timeRange === 'monthly') {
      // 4 weeks (approx) back from now, bucket by week index
      const startOfWeek = (d: Date) => { const day = new Date(d); const diff = day.getDate() - day.getDay(); return new Date(day.setDate(diff)); };
      for (let w = 3; w >= 0; w--) {
        const ref = new Date(now);
        ref.setDate(now.getDate() - w*7);
        const start = startOfWeek(ref); start.setHours(0,0,0,0);
        const end = new Date(start); end.setDate(start.getDate()+6); end.setHours(23,59,59,999);
        buckets.push({ name: `Week ${4-w}`, start, end });
      }
    } else {
      // quarterly: current month and previous 2 months
      for (let m = 2; m >= 0; m--) {
        const ref = new Date(now.getFullYear(), now.getMonth()-m, 1);
        const start = new Date(ref);
        const end = new Date(ref.getFullYear(), ref.getMonth()+1, 0, 23,59,59,999);
        const label = ref.toLocaleDateString(undefined, { month: 'short' });
        buckets.push({ name: label, start, end });
      }
    }

    const isAdmin = user.role === 'admin';
    const bucketData = buckets.map(b => {
      const salesCount = sales.filter(s => (isAdmin || s.employeeId === user.id) && new Date(s.createdAt) >= b.start && new Date(s.createdAt) <= b.end && (s.status === 'verified' || s.status === 'delivered')).length;
      const leadsCount = leads.filter(l => (isAdmin || l.employeeId === user.id) && new Date(l.createdDate) >= b.start && new Date(l.createdDate) <= b.end).length;
      return { name: b.name, sales: salesCount, leads: leadsCount };
    });

    return bucketData;
  }, [sales, leads, user, timeRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" name="Sales" />
              <Bar dataKey="leads" fill="#82ca9d" name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
