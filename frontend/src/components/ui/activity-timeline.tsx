import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSales } from '@/contexts/SalesContext';
import { useAuth } from '@/contexts/AuthContext';

type ActivityTimelineProps = {
  timeRange: 'weekly' | 'monthly' | 'quarterly';
  className?: string;
};

export function ActivityTimeline({ timeRange, className }: ActivityTimelineProps) {
  const { sales } = useSales();
  const { user } = useAuth();

  const getStartDate = (): Date => {
    const now = new Date();
    const d = new Date(now);
    if (timeRange === 'weekly') d.setDate(now.getDate() - 6);
    else if (timeRange === 'monthly') d.setMonth(now.getMonth() - 1);
    else d.setMonth(now.getMonth() - 3);
    return d;
  };

  const start = getStartDate();

  // helper for relative time label
  const timeAgo = (date: Date): string => {
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (hours < 1) return `${mins} min ago`;
    if (hours < 24) return `${hours} hour${hours>1?'s':''} ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const activities = (user ? sales.filter(s => s.employeeId === user.id) : sales)
    .filter(s => new Date(s.createdAt) >= start && (s.status === 'verified' || s.status === 'delivered'))
    .sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(s => ({
      time: timeAgo(new Date(s.createdAt)),
      action: `Closed deal with ${s.clientName}`,
      value: s.totalCost ? `PKR ${s.totalCost.toLocaleString()}` : ''
    }));




  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Your Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity.</p>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="h-3 w-3 rounded-full bg-indigo-500" />
                  {index !== activities.length - 1 && (
                    <div className="h-full w-px bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="font-medium">{activity.action}</p>
                  {activity.value && (
                    <p className="text-sm text-green-600">+{activity.value}</p>
                  )}
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))
          )}
        </div>

      </CardContent>
    </Card>
  );
}
