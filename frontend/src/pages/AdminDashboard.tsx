import { KPICard } from '@/components/ui/kpi-card';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, TrendingUp, Calculator, Edit, UserX } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { RefreshButton } from '@/components/ui/refresh-button';
import { AnalyticsChart } from '@/components/ui/analytics-chart';

// helper hook to get previous value
function usePrevious<T>(value: T) {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

import { useSales } from '@/contexts/SalesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/contexts/LeadsContext';
export const AdminDashboard = () => {
  const { sales, refreshSales } = useSales();
  const { users } = useAuth();
  const { deleteUser } = useAuth();
  const { refreshLeads } = useLeads();
  const { /* @ts-ignore */ refreshUsers } = useAuth() as any;

  // ----- Real-time KPI calculations -----
  const confirmedSales = sales.filter(s => s.status === 'verified' || s.status === 'delivered');
  const totalConfirmedSales = confirmedSales.length;

  const now = new Date();
  const monthlySales = confirmedSales.filter(s => {
    const dt = new Date(s.createdAt);
    return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
  });

  const getEmployeeName = (id?: string) => {
    if (!id) return '—';
    const fromUsers = users.find(u => String(u.id) === String(id))?.name;
    return fromUsers ?? '';
  };
  const monthlyRevenue = monthlySales.reduce((acc, s) => acc + s.totalCost, 0);

  const totalBonusesPaid = confirmedSales.reduce((acc, s) => acc + s.totalCost * 0.1, 0);

  const employeeCount = users.length;
  const prevCount = usePrevious(employeeCount);
  const countChange = prevCount !== undefined ? employeeCount - prevCount : 0;

  const kpis = [
    { title: 'Completed Sales', value: totalConfirmedSales, icon: <TrendingUp className="h-4 w-4" />, path: '/sales', tooltip: 'Number of sales marked verified or delivered.' },
    { title: 'Monthly Revenue', value: `PKR ${monthlyRevenue.toLocaleString()}`, icon: <DollarSign className="h-4 w-4" />, path: '/reports', tooltip: 'Sum of confirmed sales total amount for the current month.' },
    { title: 'Total Bonuses Paid', value: `PKR ${totalBonusesPaid.toLocaleString()}`, icon: <Calculator className="h-4 w-4" />, path: '/payroll', tooltip: 'Estimated bonuses based on confirmed sales (demo 10%).' },
    { title: 'Employees', value: employeeCount, change: countChange, changeType: countChange>=0?'positive':'negative', icon: <Users className="h-4 w-4" />, path: '/admin/users', tooltip: 'Active users count in the system.' },
  ];

  const employeeStats = users.map(emp => {
    const empSales = confirmedSales.filter(s => s.employeeId === emp.id);
    const salesCount = empSales.length;
    const revenue = empSales.reduce((acc, s) => acc + s.totalCost, 0);
    return { ...emp, sales: salesCount, revenue };
  });

  // Open a print-friendly window first; user can download via Print -> Save as PDF
  const exportAdminReportPdf = () => {
    const formatCurrency = (n: number) => `PKR ${Number(n || 0).toLocaleString()}`;
    const empRows = employeeStats.map(emp => `
      <tr>
        <td>${emp.name || ''}</td>
        <td>${emp.role || ''}</td>
        <td>${emp.status || ''}</td>
        <td style="text-align:right">${emp.sales ?? 0}</td>
        <td style="text-align:right">${formatCurrency(emp.revenue ?? 0)}</td>
      </tr>`).join('');

    const salesRows = confirmedSales.map(s => `
      <tr>
        <td>${getEmployeeName(s.employeeId)}</td>
        <td style="text-align:right">${formatCurrency(s.totalCost)}</td>
        <td>${s.status}</td>
        <td>${new Date(s.createdAt).toLocaleString()}</td>
      </tr>`).join('');

    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Admin Report</title>
        <style>
          :root {
            --bg: #0b1020;
            --card: #121831;
            --muted: #94a3b8;
            --text: #e5e7eb;
            --brand: #6366f1;
            --brand-2: #22d3ee;
            --border: #1f2847;
            --table-row: #0f1530;
          }
          @media print { .no-print { display: none !important; } }
          * { box-sizing: border-box; }
          body { margin: 0; background: linear-gradient(135deg, #0b1020, #0d1226); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
          .container { max-width: 1024px; margin: 0 auto; padding: 32px 24px 48px; }
          .toolbar { position: sticky; top: 0; z-index: 10; backdrop-filter: blur(8px); background: linear-gradient(90deg, rgba(11,16,32,.75), rgba(13,18,38,.75)); border-bottom: 1px solid var(--border); padding: 12px 24px; display: flex; gap: 8px; justify-content: flex-end; }
          .btn { background: linear-gradient(90deg, var(--brand), var(--brand-2)); color: white; border: none; padding: 10px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 10px 20px rgba(99,102,241,.25); }
          .btn.secondary { background: transparent; border: 1px solid var(--border); color: var(--muted); }
          header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 18px 0 20px; }
          .brand { display: flex; align-items: center; gap: 12px; }
          .logo { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--brand), var(--brand-2)); box-shadow: 0 8px 24px rgba(34,211,238,.25); }
          h1 { margin: 0; font-size: 24px; letter-spacing: .2px; }
          .meta { color: var(--muted); font-size: 12px; }
          .cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
          .card { background: radial-gradient(1200px 600px at -10% -50%, rgba(99,102,241,.15), transparent 60%), radial-gradient(800px 400px at 120% 130%, rgba(34,211,238,.12), transparent 50%), var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 14px; box-shadow: 0 10px 30px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.02); }
          .card .label { color: var(--muted); font-size: 12px; }
          .card .value { font-size: 22px; font-weight: 700; margin-top: 6px; }
          section { margin-top: 26px; }
          section h2 { font-size: 14px; letter-spacing: .4px; text-transform: uppercase; color: var(--muted); margin: 0 0 10px; }
          table { width: 100%; border-collapse: separate; border-spacing: 0; overflow: hidden; border-radius: 12px; background: var(--card); border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.02); }
          thead th { background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,0)); color: var(--muted); font-weight: 600; font-size: 12px; text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); }
          tbody td { padding: 12px; border-bottom: 1px solid var(--border); font-size: 13px; }
          tbody tr:nth-child(2n) td { background: var(--table-row); }
          td.num, th.num { text-align: right; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 9999px; border: 1px solid var(--border); color: var(--muted); font-size: 11px; }
          footer { margin-top: 28px; text-align: center; color: var(--muted); font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="no-print toolbar">
          <button class="btn" onclick="window.print()">Download PDF</button>
          <button class="btn secondary" onclick="window.close()">Close</button>
        </div>
        <div class="container">
          <header>
            <div class="brand">
              <div class="logo"></div>
              <div>
                <h1>Admin Report</h1>
                <div class="meta">Generated: ${new Date().toLocaleString()}</div>
              </div>
            </div>
          </header>

          <section>
            <div class="cards">
              <div class="card"><div class="label">Completed Sales</div><div class="value">${totalConfirmedSales}</div></div>
              <div class="card"><div class="label">Monthly Revenue</div><div class="value">${formatCurrency(monthlyRevenue)}</div></div>
              <div class="card"><div class="label">Total Bonuses Paid</div><div class="value">${formatCurrency(totalBonusesPaid)}</div></div>
              <div class="card"><div class="label">Employees</div><div class="value">${employeeCount}</div></div>
            </div>
          </section>

          <section>
            <h2>Employee Performance</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th class="num">Sales</th>
                  <th class="num">Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${empRows.replace(/<td>([^<]*active[^<]*)<\/td>/gi, '<td><span class="badge">$1<\/span><\/td>')}
              </tbody>
            </table>
          </section>

          <section>
            <h2>Confirmed Sales</h2>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th class="num">Total Cost</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                ${salesRows}
              </tbody>
            </table>
          </section>

          <footer>
            Report generated by Admin Dashboard
          </footer>
        </div>
      </body>
    </html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    try { win.focus(); } catch {}
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Company overview and employee management
          </p>
        </div>
        <div className="flex gap-2">
          <RefreshButton onRefresh={async ()=>{ await Promise.all([
            refreshSales(),
            refreshLeads(),
            typeof refreshUsers === 'function' ? refreshUsers() : Promise.resolve(),
          ]); }} />
          <Button onClick={exportAdminReportPdf}>Generate Report</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Link
            key={index}
            to={kpi.path}
            className="hover:scale-105 transition-transform active:scale-95"
          >
            <KPICard title={kpi.title} value={kpi.value} icon={kpi.icon} className="cursor-pointer" tooltip={(kpi as any).tooltip} change={(kpi as any).change} changeType={(kpi as any).changeType} />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Employee Roster */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Employee Roster</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeStats.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Badge variant={employee.status === 'active' ? 'default' : 'destructive'}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.sales}</TableCell>
                    <TableCell>PKR {employee.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link to="/admin/users" className="text-muted-foreground"><Edit className="h-4 w-4" /></Link>
                        <Button variant="ghost" size="sm" onClick={() => deleteUser(employee.id)}>
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Global Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Salary</label>
              <p className="text-2xl font-bold">PKR 30,000</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sales Target</label>
              <p className="text-2xl font-bold">12 sales</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Revenue Target</label>
              <p className="text-2xl font-bold">PKR 400K</p>
            </div>
            <Button variant="outline" className="w-full">
              Modify Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <AnalyticsChart timeRange="monthly" />
    </div>
  );
};