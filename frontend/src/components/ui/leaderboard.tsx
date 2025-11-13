import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSales } from '@/contexts/SalesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/contexts/EmployeesContext';

type LeaderboardProps = {
  timeRange: 'weekly' | 'monthly' | 'quarterly';
};

export function Leaderboard({ timeRange }: LeaderboardProps) {
  const { sales } = useSales();
  const { users } = useAuth();
  const { employees } = useEmployees();

  const getStartDate = (): Date => {
    const now = new Date();
    const d = new Date(now);
    if (timeRange === 'weekly') d.setDate(now.getDate() - 6);
    else if (timeRange === 'monthly') d.setMonth(now.getMonth() - 1);
    else d.setMonth(now.getMonth() - 3);
    return d;
  };

  const start = getStartDate();

  // count verified sales per employee within range
  const filtered = sales.filter(s => (s.status === 'verified' || s.status === 'delivered') && new Date(s.createdAt) >= start);
  const counts: Record<string, number> = {};
  filtered.forEach(s => {
    counts[s.employeeId] = (counts[s.employeeId] || 0) + 1;
  });

  const leaders = Object.entries(counts)
    .map(([empId, count]) => {
      const user = users.find(u => u.id === empId);
      const emp = employees.find(e => e.id === empId);
      return { id: empId, name: user?.name || emp?.name || empId, sales: count, avatar: '' };
    })
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top Performers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaders.length === 0 ? (
            <p className="text-sm text-gray-500">No data for selected range.</p>
          ) : (
            leaders.map((person, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-medium w-6">{index + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={person.avatar} />
                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{person.name}</span>
                </div>
                <div className="text-lg font-medium">{person.sales} sales</div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
