import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, FileText, Eye, CheckCircle } from "lucide-react";
import TimeFrameFilter, { TimeFrameFilterValue } from '@/components/ui/timeframe-filter';
import { createDatePredicate } from '@/utils/date';
import { useState, useEffect } from 'react';
import { useSales } from '@/contexts/SalesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { useLeads } from '@/contexts/LeadsContext';
import { useEmployees } from '@/contexts/EmployeesContext';

const SalesPage = () => {
  
  







      


  const { sales, getSalesByEmployee, getPendingSales, updateSaleStatus, deleteSale, refreshSales } = useSales();
  const { updateLead, leads } = useLeads();
  const { user, users } = useAuth();
  const { employees } = useEmployees();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [tfFilter, setTfFilter] = useState<TimeFrameFilterValue>({ timeframe: 'daily' });

  useEffect(() => {
    // Ensure Supabase data is fetched when this page mounts / user changes
    refreshSales();
  }, [refreshSales]);

  const fullSales = user?.role === 'admin' ? sales : getSalesByEmployee(user.id);
  const datePred = createDatePredicate(tfFilter.timeframe,
    tfFilter.customStart ? new Date(tfFilter.customStart) : undefined,
    tfFilter.customEnd ? new Date(tfFilter.customEnd) : undefined);
  const userSales = fullSales.filter(s => datePred(new Date(s.createdAt)));
  // ----- Real-time KPI calculations -----
  const currentYear = new Date().getFullYear();
  const salesYTD = userSales.filter(
    (s) => new Date(s.createdAt).getFullYear() === currentYear
  );
  const totalSales = salesYTD.length;
  const revenue = salesYTD.reduce(
    (acc, s) => acc + Number(s.totalCost || 0),
    0
  );
  const avgDeal = totalSales ? revenue / totalSales : 0;

  const kpis = [
    {
      title: 'Total Sales (YTD)',
      value: totalSales,
      changeType: 'neutral' as const,
      icon: <TrendingUp className='h-4 w-4' />,
    },
    {
      title: 'Revenue (YTD)',
      value: `PKR ${revenue.toLocaleString()}`,
      changeType: 'neutral' as const,
      icon: <DollarSign className='h-4 w-4' />,
    },
    {
      title: 'Avg. Deal Size',
      value: `PKR ${avgDeal.toLocaleString()}`,
      changeType: 'neutral' as const,
      icon: <span className="p-1 rounded-full hover:bg-primary/10 hover:scale-105 transition-transform"><Eye className="h-4 w-4" /></span>,
    },
  ];

  const pendingSales = getPendingSales();

  const getEmployeeName = (id?: string) => {
    if (!id) return '—';
    // Prefer AuthContext.users (Supabase employees), fallback to EmployeesContext
    const fromUsers = users?.find(u => String(u.id) === String(id))?.name;
    if (fromUsers) return fromUsers;
    const fromEmployees = employees.find(e => String(e.id) === String(id))?.name;
    return fromEmployees ?? id;
  };

  const getLeadOwnerName = (leadId?: string) => {
    if (!leadId) return '—';
    const lead = leads.find(l => String(l.id) === String(leadId));
    if (!lead) return '—';
    return getEmployeeName(lead.employeeId);
  };

  const handleApprove = (sale) => {
    updateSaleStatus(sale.id, 'verified');
  };

  const handleReject = (sale) => {
    updateSaleStatus(sale.id, 'rejected');
    updateLead(sale.leadId, { status: 'negotiation' });
  };

  const handleDelivered = async (saleId: string) => {
    if (user?.role !== 'admin') return; // only admin can mark delivered
    updateSaleStatus(saleId, 'delivered');
  };

const handleDelete = (saleId: string) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      deleteSale(saleId);
    }
  };

  return (
    <div className="flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {user?.role === 'admin' && (
            <TabsTrigger value="review">Review</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <TimeFrameFilter value={tfFilter} onChange={setTfFilter} className="mb-4" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sales Overview</h1>
              <p className="text-muted-foreground">Company-wide sales performance metrics</p>
            </div>

            {/* KPI cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {kpis.map((kpi) => (
                <KPICard key={kpi.title} {...kpi} />
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Sales Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This section will include charts, tables, and filters for in-depth analysis. Coming soon.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales</CardTitle>
                <CardDescription>List of all sales</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Advance</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Project Scope</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>View</TableHead>
                      {user?.role === 'admin' && <TableHead>Delivered</TableHead>}
                      <TableHead>Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fullSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {sale.employeeName || getLeadOwnerName(sale.leadId) || getEmployeeName(sale.employeeId)}
                        </TableCell>
                        <TableCell>{sale.totalCost}</TableCell>
                        <TableCell>{sale.advanceAmount}</TableCell>
                        <TableCell>{new Date(sale.deliveryDate).toDateString()}</TableCell>
                        <TableCell>{sale.projectScope}</TableCell>
                        <TableCell>{sale.status}</TableCell>
                        <TableCell>
                          <Link to={`/sales/${sale.id}`} className="p-1 rounded-full text-primary hover:bg-primary/10 hover:scale-105 transition-transform">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </TableCell>
                        {user?.role === 'admin' && (
                          <TableCell>
                            {sale.status !== 'delivered' && (
                              <Button size="sm" variant="outline" onClick={() => handleDelivered(sale.id)}>
                                <CheckCircle className="h-4 w-4 mr-1" /> Delivered
                              </Button>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(sale.id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {user?.role === 'admin' && (
          <TabsContent value="review">
            <Card>
              <CardHeader>
                <CardTitle>Review Sales</CardTitle>
                <CardDescription>Pending sales for verification</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Advance</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Project Scope</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {sale.employeeName || getLeadOwnerName(sale.leadId) || getEmployeeName(sale.employeeId)}
                        </TableCell>
                        <TableCell>{sale.totalCost}</TableCell>
                        <TableCell>{sale.advanceAmount}</TableCell>
                        <TableCell>{new Date(sale.deliveryDate).toDateString()}</TableCell>
                        <TableCell>{sale.projectScope}</TableCell>
                        <TableCell>
                          <Button onClick={() => handleApprove(sale)}>Approve</Button>
                          <Button variant="destructive" onClick={() => handleReject(sale)}>Reject</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export { SalesPage };
export default SalesPage;
