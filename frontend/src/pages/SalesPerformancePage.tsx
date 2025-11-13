import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PerformanceMetrics } from '@/components/ui/performance-metrics';
import { AnalyticsChart } from '@/components/ui/analytics-chart';
import { Leaderboard } from '@/components/ui/leaderboard';
import { ActivityTimeline } from '@/components/ui/activity-timeline';

export default function SalesPerformancePage() {
  const [timeRange, setTimeRange] = useState<string>('monthly');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sales Performance Dashboard</h1>
      
      <Tabs value={timeRange} onValueChange={setTimeRange}>
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <PerformanceMetrics timeRange="weekly" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <AnalyticsChart timeRange="weekly" />
            <Leaderboard timeRange="weekly" />
          </div>
          <ActivityTimeline timeRange="weekly" className="mt-6" />
        </TabsContent>

        <TabsContent value="monthly">
          <PerformanceMetrics timeRange="monthly" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <AnalyticsChart timeRange="monthly" />
            <Leaderboard timeRange="monthly" />
          </div>
          <ActivityTimeline timeRange="monthly" className="mt-6" />
        </TabsContent>

        <TabsContent value="quarterly">
          <PerformanceMetrics timeRange="quarterly" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <AnalyticsChart timeRange="quarterly" />
            <Leaderboard timeRange="quarterly" />
          </div>
          <ActivityTimeline timeRange="quarterly" className="mt-6" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
