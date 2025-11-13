import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import { AreaChart, Line, XAxis, YAxis, Tooltip, Area, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useSales } from '@/contexts/SalesContext';
import { calculateCommission } from '@/utils/commission';
import { Wallet, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface PaymentHistoryItem {
  month: string;
  amount: number;
}

const PayrollDetailPage = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { users } = useAuth();
  const { sales } = useSales();

  const employee = users.find(u => u.id === employeeId);

  const verifiedSales = sales.filter(s => (s.status === 'verified' || s.status === 'delivered') && s.employeeId === employeeId);

  // monthly payment (commission 10% of revenue per earlier logic)
  const payments: PaymentHistoryItem[] = useMemo(() => {
    const map: Record<string, number> = {};
    verifiedSales.forEach(s => {
      const d = new Date(s.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`; // simple key
      const { commission: saleCommission, isValid } = calculateCommission({
        projectAmount: s.totalCost,
        advanceAmount: s.advanceAmount,
      });
      if (isValid) {
        map[key] = (map[key] || 0) + saleCommission;
      }
    });
    return Object.entries(map).map(([k, v]) => ({ month: k, amount: v })).sort((a,b)=>a.month.localeCompare(b.month));
  }, [verifiedSales]);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const monthlyAvg = payments.length ? totalPaid / payments.length : 0;
  const growthRate = payments.length > 1 ? ((payments[payments.length-1].amount - payments[0].amount) / payments[0].amount) * 100 : 0;

  if (!employee) {
    return (
      <div className="p-6 space-y-4">
        <p>Employee not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const kpis = [
    { title: 'Total Paid', value: `PKR ${totalPaid.toLocaleString()}`, icon: <Wallet className="h-4 w-4" /> },
    { title: 'Average Monthly', value: `PKR ${monthlyAvg.toLocaleString()}`, icon: <Wallet className="h-4 w-4" /> },
    { title: 'Growth Rate', value: `${growthRate.toFixed(1)}%`, icon: <TrendingUp className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Gradient banner */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <svg className="absolute -bottom-8 left-0 w-full h-24 text-white opacity-20" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M0,64L40,85.3C80,107,160,149,240,170.7C320,192,400,192,480,170.7C560,149,640,107,720,74.7C800,43,880,21,960,16C1040,11,1120,21,1200,42.7C1280,64,1360,96,1400,112L1440,128L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"></path>
        </svg>
        <div className="relative p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">{employee.name}</h2>
            <p className="text-white/80 text-sm capitalize">{employee.role.replace('_',' ')}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map(k => (<KPICard key={k.title} {...k} />))}
      </div>

      {/* Payment history chart */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={payments} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" fillOpacity={1} fill="url(#colorPay)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground">No payments yet.</p>}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="font-medium">Method:</span> {employee.paymentMethod || 'Bank Transfer'}</p>
          <p><span className="font-medium">Account #:</span> {employee.accountNumber || 'N/A'}</p>
          <p><span className="font-medium">Expected Next Amount:</span> PKR {(monthlyAvg).toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollDetailPage;
