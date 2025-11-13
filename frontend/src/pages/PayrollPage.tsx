import { KPICard } from "@/components/ui/kpi-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSales } from "@/contexts/SalesContext";
import { calculateCommission } from "@/utils/commission";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Users, DollarSign } from "lucide-react";
import { Link } from 'react-router-dom';

const PayrollPage = () => {
  const { sales } = useSales();
  const { users } = useAuth();
  const storedEmployees: any[] = JSON.parse(localStorage.getItem('employees') || '[]');
  const { settings } = useSettings();

  const verifiedSales = sales.filter(s => s.status === 'verified' || s.status === 'delivered');

  // per-employee salary calculations
  const employees = users.map(u => {
    const empLocal = storedEmployees.find(e => (e.id === u.id) || (e.name === u.name));
    const empSales = verifiedSales.filter(s => s.employeeId === u.id);
    const revenue = empSales.reduce((sum, s) => sum + s.totalCost, 0);
    // Calculate commission based on performance rules per sale
    const commission = empSales.reduce((sum, sale) => {
      const { commission: saleCommission, isValid } = calculateCommission({
        projectAmount: sale.totalCost,
        advanceAmount: (sale as any).advanceAmount ?? (sale as any).paymentReceived ?? 0,
      });
      return isValid ? sum + saleCommission : sum;
    }, 0);
    const baseSalary = empLocal ? empLocal.salary : settings.baseSalary;
    const salary = baseSalary + commission;
    return { ...u, commission, salary };
  });

  const totalSalaryExpense = employees.reduce((sum, e) => sum + e.salary, 0);
  const totalBonuses = employees.reduce((sum, e) => sum + e.commission, 0);
  const employeeCount = employees.length;

  const kpis = [
    {
      title: "Total Salary Expense (This Month)",
      value: `PKR ${totalSalaryExpense.toLocaleString()}`,
      icon: <Wallet className="h-4 w-4" />,
    },
    {
      title: "Bonuses Paid (This Month)",
      value: `PKR ${totalBonuses.toLocaleString()}`,
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: "Employees On Payroll",
      value: employeeCount,
      icon: <Users className="h-4 w-4" />,
    },
  ];


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payroll Overview</h1>
        <p className="text-muted-foreground">Track salary disbursements and bonuses</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
          <CardTitle>Payroll Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Salary</TableHead>
                <TableHead className="text-right">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium text-primary hover:underline">
                    <Link to={`/payroll/${emp.id}`}>{emp.name}</Link>
                  </TableCell>
                  <TableCell>{emp.role.replace('_', ' ')}</TableCell>
                  <TableCell className="text-right">PKR {emp.salary.toLocaleString()}</TableCell>
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

export { PayrollPage };
export default PayrollPage;
