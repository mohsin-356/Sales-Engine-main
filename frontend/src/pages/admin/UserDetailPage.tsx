import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSales } from '@/contexts/SalesContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { KPICard } from '@/components/ui/kpi-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useMemo, useEffect } from 'react';
import { api } from '@/lib/api';

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, users, updateUser } = useAuth();
  const { sales } = useSales();

  const user = users.find(u => u.id === id);
  if (!user) {
    // If user not found, redirect back
    navigate('/admin/users');
    return null;
  }

  // Restrict access to admins only
  if (currentUser?.role !== 'admin') {
    navigate('/');
    return null;
  }

  const userSales = useMemo(() => sales.filter(s => s.employeeId === user.id && s.status === 'verified'), [sales, user.id]);
  const totalSales = userSales.length;
  const revenue = userSales.reduce((sum, s) => sum + s.totalCost, 0);
  const commissionRate = user.commissionRate ?? 0.1; // default 10%
  const commissionEarned = revenue * commissionRate;

  const [name, setName] = useState(user.name ?? '');
  const [email, setEmail] = useState(user.email ?? '');
  const [password, setPassword] = useState(user.password ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [salary, setSalary] = useState(user.salary ?? 50000);
  const [rate, setRate] = useState(commissionRate * 100);

  // Targets UI state
  const now = new Date();
  const [tMonth, setTMonth] = useState(now.getMonth() + 1);
  const [tYear, setTYear] = useState(now.getFullYear());
  const [leadTarget, setLeadTarget] = useState<number>(0);
  const [salesTarget, setSalesTarget] = useState<number>(0);
  const [revenueTarget, setRevenueTarget] = useState<number>(0);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const loadTargets = async () => {
    setLoadingTargets(true);
    try {
      const rows = await api.get(`/targets/user/${user.id}?month=${tMonth}&year=${tYear}`);
      const rec = rows?.[0];
      setLeadTarget(Number(rec?.lead_target ?? 0));
      setSalesTarget(Number(rec?.sales_target ?? 0));
      setRevenueTarget(Number(rec?.revenue_target ?? 0));
    } finally { setLoadingTargets(false); }
  };

  const saveTargets = async () => {
    await api.post(`/targets/user/${user.id}`,{ month: tMonth, year: tYear, leadTarget, salesTarget, revenueTarget });
    await loadTargets();
    // refresh brief history
    const all = await api.get(`/targets/user/${user.id}`);
    setHistory(all?.slice(-6).reverse() ?? []);
  };

  useEffect(() => { loadTargets(); }, [tMonth, tYear, user.id]);
  useEffect(() => { (async ()=>{ const all = await api.get(`/targets/user/${user.id}`); setHistory(all?.slice(-6).reverse() ?? []); })(); }, [user.id]);

  const saveChanges = () => {
    updateUser({
      ...user,
      name,
      email,
      // Only send password if changed or non-empty
      password: password ?? user.password,
      salary: Number(salary),
      commissionRate: Number(rate) / 100,
    });
  };

  const kpis = [
    { title: 'Total Sales', value: totalSales },
    { title: 'Revenue', value: `PKR ${revenue.toLocaleString()}` },
    { title: 'Commission Earned', value: `PKR ${commissionEarned.toFixed(0)}` },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">{user.name}'s Profile & Performance</h1>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map(k => (
          <KPICard key={k.title} {...k} />
        ))}
      </div>

      {/* Identity & Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>Identity & Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Email (Username)</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Admins can update user passwords. Consider enforcing a policy to share new credentials securely.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compensation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Compensation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Base Salary (PKR)</label>
              <Input type="number" value={salary} onChange={e => setSalary(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Commission Rate (%)</label>
              <Input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} />
            </div>
          </div>
          <Button onClick={saveChanges}>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Monthly Targets (Admin only) */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm mb-1">Month (1-12)</label>
              <Input type="number" min={1} max={12} value={tMonth} onChange={e=>setTMonth(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Year</label>
              <Input type="number" value={tYear} onChange={e=>setTYear(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Lead Target</label>
              <Input type="number" value={leadTarget} onChange={e=>setLeadTarget(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Sales Target</label>
              <Input type="number" value={salesTarget} onChange={e=>setSalesTarget(Number(e.target.value))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Revenue Target (PKR)</label>
              <Input type="number" value={revenueTarget} onChange={e=>setRevenueTarget(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadTargets} disabled={loadingTargets}>Load</Button>
            <Button onClick={saveTargets} disabled={loadingTargets}>Save Targets</Button>
          </div>

          {history?.length>0 && (
            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-1">Recent Target History</div>
              <ul className="text-sm space-y-1">
                {history.map((h:any)=> (
                  <li key={`${h.year}-${h.month}`} className="flex gap-3">
                    <span className="w-20">{String(h.month).padStart(2,'0')}/{h.year}</span>
                    <span>Leads: {h.lead_target}</span>
                    <span>Sales: {h.sales_target}</span>
                    <span>Revenue: PKR {Number(h.revenue_target||0).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailPage;
