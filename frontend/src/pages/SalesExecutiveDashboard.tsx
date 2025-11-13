import { useSales } from '@/contexts/SalesContext';
import { useLeads } from '@/contexts/LeadsContext';
import { KPICard } from '@/components/ui/kpi-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, Target, Clock } from 'lucide-react';

export default function SalesExecutiveDashboard() {
  const { sales } = useSales();
  const { leads } = useLeads();

  const confirmedSales = sales.filter(s => s.status === 'verified' || s.status === 'delivered');
  const totalConfirmedSales = confirmedSales.length;
  const totalRevenue = confirmedSales.reduce((sum, s) => sum + (s.totalCost ?? 0), 0);

  const now = new Date();
  const upcomingFollowUps = leads.filter(l => l.followUpDate && new Date(l.followUpDate) >= now).sort((a,b)=> new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime());
  const overdueFollowUps = leads.filter(l => l.followUpDate && new Date(l.followUpDate) < now);

  const openLeads = leads.filter(l => {
    const status = (l.status || '').toLowerCase();
    return !['converted','won','lost','closed'].includes(status);
  });

  const recentSales = [...sales]
    .sort((a:any,b:any)=> new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0,5);
  const attentionLeads = [...overdueFollowUps, ...upcomingFollowUps].slice(0,5);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Executive Portal</h1>
        <p className="text-muted-foreground">Company overview. Use the sidebar for Sales and Leads.</p>
      </div>

      {/* KPI overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Verified/Delivered Sales" value={totalConfirmedSales} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <KPICard title="Open Leads" value={openLeads.length} icon={<Target className="h-5 w-5" />} />
        <KPICard title="Follow-ups (Due/Upcoming)" value={`${overdueFollowUps.length}/${upcomingFollowUps.length}`} icon={<Clock className="h-5 w-5" />} />
      </div>

      {/* Quick previews */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Sales</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/executive/sales">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((s:any) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.customerName || s.leadName || '—'}</TableCell>
                    <TableCell className="capitalize">{s.status}</TableCell>
                    <TableCell className="text-right">${(s.totalCost ?? 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {recentSales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No sales yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Leads Needing Attention</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/executive/leads">Manage leads</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Follow-up</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attentionLeads.map((l:any) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.name || l.customerName || '—'}</TableCell>
                    <TableCell className="capitalize">{l.status || '—'}</TableCell>
                    <TableCell>{l.followUpDate ? new Date(l.followUpDate).toLocaleDateString() : '—'}</TableCell>
                  </TableRow>
                ))}
                {attentionLeads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No follow-ups due</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}