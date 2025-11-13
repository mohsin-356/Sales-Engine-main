import { KPICard } from '@/components/ui/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSales } from '@/contexts/SalesContext';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Award, Target, DollarSign } from 'lucide-react';
import TimeFrameFilter, { TimeFrameFilterValue } from '@/components/ui/timeframe-filter';
import { ChartContainer, ChartTooltipContent, ChartLegend } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { createDatePredicate } from '@/utils/date';
import React from 'react';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const TeamPerformancePage: React.FC = () => {
  const [tfFilter, setTfFilter] = React.useState<TimeFrameFilterValue>({ timeframe: 'daily' });
  const { sales } = useSales();
  const { users, user: currentUser } = useAuth();

  const datePred = createDatePredicate(tfFilter.timeframe,
    tfFilter.customStart ? new Date(tfFilter.customStart) : undefined,
    tfFilter.customEnd ? new Date(tfFilter.customEnd) : undefined);
  // For Employee Breakdown we want live lifetime totals; for charts we still respect timeframe
  const allVerifiedSales = sales.filter(s => s.status === 'verified' || s.status === 'delivered');
  const verifiedSales = sales.filter(s => {
    const ts = s.deliveryDate || s.createdAt;
    return (s.status === 'verified' || s.status === 'delivered') && ts && datePred(new Date(ts));
  });

  // Aggregate metrics per employee, including reps not in users list
  const salesByRep = new Map<string, { salesCount: number; revenue: number; name?: string }>();
  for (const s of allVerifiedSales) {
    const key = s.employeeId || 'unknown';
    const entry = salesByRep.get(key) || { salesCount: 0, revenue: 0, name: s.employeeName };
    entry.salesCount += 1;
    entry.revenue += s.totalCost;
    if (!entry.name && s.employeeName) entry.name = s.employeeName;
    salesByRep.set(key, entry);
  }

  const perEmployee = Array.from(salesByRep.entries()).map(([employeeId, stats]) => {
    const u = users.find((usr) => usr.id === employeeId) || (currentUser && currentUser.id === employeeId ? currentUser : undefined);
    const name = u?.name || stats.name || 'Unknown Rep';
    const role = u?.role?.replace('_', ' ') || 'n/a';
    const commission = stats.revenue * 0.1;
    return {
      id: employeeId,
      name,
      role,
      salesCount: stats.salesCount,
      revenue: stats.revenue,
      commission,
    };
  });

  // Top Performer by revenue
  const topPerformer = [...perEmployee].sort((a, b) => b.revenue - a.revenue)[0];

  // Current month & previous month revenue for growth rate
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const currentMonthRevenue = verifiedSales
    .filter(s => {
      const d = new Date(s.deliveryDate || s.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((sum, s) => sum + s.totalCost, 0);

  const prevMonthRevenue = verifiedSales
    .filter(s => {
      const d = new Date(s.deliveryDate || s.createdAt);
      return d.getMonth() === (month === 0 ? 11 : month - 1) && d.getFullYear() === (month === 0 ? year - 1 : year);
    })
    .reduce((sum, s) => sum + s.totalCost, 0);

  const growthRate = prevMonthRevenue ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

  // Target achievement (assuming global sales target 12 per month)
  const SALES_TARGET = 12;
  const targetAchievedPct = Math.min(100, (currentMonthRevenue / (SALES_TARGET * 100000)) * 100); // rough target

  // ---- Chart datasets ----
  // last 6 months revenue
  const monthsData = [...Array(6)].map((_, idx) => {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    const m = targetDate.getMonth();
    const y = targetDate.getFullYear();
    const monthRevenue = verifiedSales.filter(s => {
      const d = new Date(s.deliveryDate || s.createdAt);
      return d.getMonth() === m && d.getFullYear() === y;
    }).reduce((sum, s) => sum + s.totalCost, 0);
    return { month: MONTH_NAMES[m], revenue: monthRevenue };
  });

  // cumulative sales count over time for line chart
  const sortedSales = [...verifiedSales].sort((a,b)=> new Date(a.deliveryDate || a.createdAt).getTime() - new Date(b.deliveryDate || b.createdAt).getTime());
  let cumulative = 0;
  const salesCumulative = sortedSales.map(s=> {
    cumulative += 1;
    const ts = s.deliveryDate || s.createdAt;
    return { date: new Date(ts).toLocaleDateString('en-GB',{day:'2-digit',month:'short'}), count: cumulative};
  });

  const kpis = [
    { title: 'Top Performer', value: topPerformer?.name || 'N/A', icon: <Award className="h-4 w-4" /> },
    { title: 'Growth Rate', value: `${growthRate.toFixed(1)}%`, icon: <TrendingUp className="h-4 w-4" /> },
    { title: 'Target Achieved', value: `${targetAchievedPct.toFixed(0)}%`, icon: <Target className="h-4 w-4" /> },
    { title: 'Team Revenue', value: `PKR ${currentMonthRevenue.toLocaleString()}`, icon: <DollarSign className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <TimeFrameFilter value={tfFilter} onChange={setTfFilter} />
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text font-poppins">
            Team Performance Analytics
          </h1>
          <p className="text-muted-foreground">Live overview of your team’s KPIs & achievements</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <KPICard key={i} {...k} className="bg-gradient-to-br from-slate-50 via-white to-slate-100" />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-poppins">Revenue (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ revenue: { color: '#4f46e5', label: 'Revenue' } }} className="h-72 w-full">
              <BarChart data={monthsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v)=>v.toLocaleString()} />
                <Bar dataKey="revenue" name="Revenue" fill="var(--color-revenue)" />
                <ChartTooltipContent />
                <ChartLegend payload={[]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-poppins">Cumulative Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ sales: { color: '#10b981', label: 'Sales' } }} className="h-72 w-full">
              <LineChart data={salesCumulative}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis />
                <Line type="monotone" dataKey="count" stroke="var(--color-sales)" strokeWidth={2} dot={false} name="Sales" />
                <ChartTooltipContent />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Employee table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="font-poppins">Employee Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perEmployee.map(emp => (
                <TableRow key={emp.id} className={emp.id === topPerformer?.id ? 'bg-yellow-50' : ''}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.role.replace('_', ' ')}</TableCell>
                  <TableCell className="text-right">{emp.salesCount}</TableCell>
                  <TableCell className="text-right">PKR {emp.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">PKR {emp.commission.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamPerformancePage;
