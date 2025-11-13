import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { KPICard } from '@/components/ui/kpi-card';
import { useSales } from '@/contexts/SalesContext';
import { useLeads } from '@/contexts/LeadsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/contexts/EmployeesContext';


const ReportsPage = () => {
  const { sales } = useSales();
  const { leads } = useLeads();
  const { users } = useAuth();
  const { employees } = useEmployees();
  const [startDate, setStartDate] = useState<Date|null>(null);
  const [endDate, setEndDate] = useState<Date|null>(null);

  const filteredSales = sales.filter(s => {
    if (!startDate && !endDate) return true;
    const d = new Date(s.createdAt);
    const afterStart = startDate ? d >= startDate : true;
    const beforeEnd = endDate ? d <= endDate : true;
    return afterStart && beforeEnd;
  });

  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalCost, 0);
  const avgDeal = totalSales ? totalRevenue / totalSales : 0;

  const kpis = [
    { title: 'Total Sales', value: totalSales },
    { title: 'Revenue', value: `PKR ${totalRevenue.toLocaleString()}` },
    { title: 'Avg Deal Size', value: `PKR ${avgDeal.toFixed(0)}` },
  ];

  const getEmployeeName = (id?: string) => {
    if (!id) return '—';
    const fromUsers = users?.find(u => String(u.id) === String(id))?.name;
    if (fromUsers) return fromUsers;
    const fromEmployees = employees.find(e => String(e.id) === String(id))?.name;
    return fromEmployees ?? '';
  };

  const getLeadOwnerName = (leadId?: string) => {
    if (!leadId) return '—';
    const lead = leads.find(l => String(l.id) === String(leadId));
    if (!lead) return '—';
    return getEmployeeName(lead.employeeId);
  };

  const getRepNameForSale = (s: typeof filteredSales[number]) => {
    return (
      (s as any).employeeName ||
      getEmployeeName((s as any).employeeId) ||
      getLeadOwnerName(s.leadId) ||
      ''
    );
  };

  const exportCSV = () => {
    const header = ['Employee','Total Cost','Status','Created At'];
    const rows = filteredSales.map(s => [
      getRepNameForSale(s),
      s.totalCost,
      s.status,
      s.createdAt,
    ]);
    const csvContent = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sales-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="space-y-6">
    
      <div className="flex items-center justify-between">
        <div>
          
          
        </div>
        <Button onClick={exportCSV}>Download CSV</Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <div>
          <label className="text-sm text-muted-foreground">Start Date</label>
          <DatePicker date={startDate} onChange={setStartDate} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">End Date</label>
          <DatePicker date={endDate} onChange={setEndDate} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map(k=> (<KPICard key={k.title} {...k} />))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map(s=> (
                <TableRow key={s.id}>
                  <TableCell>{getRepNameForSale(s)}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell className="text-right">PKR {s.totalCost.toLocaleString()}</TableCell>
                  <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
};

export { ReportsPage };
export default ReportsPage;
