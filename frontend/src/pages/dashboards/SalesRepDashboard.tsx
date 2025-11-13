import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import TimeFrameFilter, { TimeFrameFilterValue } from '@/components/ui/timeframe-filter';
import { useAuth } from '@/contexts/AuthContext';
import { FollowUpsSidebar } from '@/components/dashboard/FollowUpsSidebar';
import { useLeads } from '@/hooks/useLeads';
import { useRepSettings } from '@/hooks/useRepSettings'; // Ensure proper import of useRepSettings
import { calculateCommission } from '@/utils/commission';
import { useSales } from '@/contexts/SalesContext';

const mockLeads = [
  // Add mock lead data here
];

type SalesRepDashboardProps = {
  title?: string;
};

export default function SalesRepDashboard({ title = 'Sales Representative Dashboard' }: SalesRepDashboardProps) {
  const [tf, setTf] = React.useState<TimeFrameFilterValue>({ timeframe: 'monthly' });
  const { user } = useAuth();
  const mappedTf = tf.timeframe === 'weekly' ? 'weekly' : tf.timeframe === 'monthly' ? 'monthly' : 'yearly';
  const { sales } = useSales();
  // derive performance locally (no API)
  const repSettings = useRepSettings(user.id);
  // sales count progress
  const salesCount = (sales || []).filter((s: any) => !user?.id || s.employeeId === user.id).length;
  const salesTarget = repSettings?.settings?.salesTarget ?? 0;
  const salesProgress = salesTarget > 0 ? Math.min((salesCount / salesTarget) * 100, 100) : 0;
  
  const getStartDate = (): Date => {
    const now = new Date();
    const d = new Date(now);
    if (tf.timeframe === 'weekly') d.setDate(now.getDate() - 6);
    else if (tf.timeframe === 'monthly') d.setMonth(now.getMonth() - 1);
    else d.setMonth(now.getMonth() - 3);
    return d;
  };

  const start = getStartDate();
  const userSales = (sales || []).filter((s: any) => {
    if (user?.id && s.employeeId !== user.id) return false;
    const ts = s.deliveryDate || s.createdAt;
    if (!ts) return false;
    return new Date(ts) >= start && (s.status === 'verified' || s.status === 'delivered');
  });
  const verifiedSales = userSales;
  const revenueAchieved = userSales.reduce((sum: number, s: any) => sum + (Number(s.totalCost) || 0), 0);
  const commission = userSales.reduce((sum: number, s: any) => {
    const { commission: c, isValid } = calculateCommission({
      projectAmount: Number(s.totalCost || 0),
      advanceAmount: Number(s.advanceAmount ?? 0),
    });
    return sum + (isValid ? c : 0);
  }, 0);
  const recentPerformance = {
    revenue: revenueAchieved,
    commission,
    target: revenueAchieved,
    progressPercent: revenueAchieved > 0 ? 100 : 0,
  } as any;

  const { leads } = useLeads();
  const upcomingLeads = mockLeads.filter(lead => 
    lead.followUpDate && new Date(lead.followUpDate) > new Date()
  );

  const dashboardContent = (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <TimeFrameFilter value={tf} onChange={setTf} />
      </div>

      {/* Total Sales Progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Total Sales Progress</CardTitle>
          <CardDescription>{salesCount} / {salesTarget} sales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={salesProgress} />
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sales Amount Progress</CardTitle>
          <CardDescription>{tf.timeframe.charAt(0).toUpperCase()+tf.timeframe.slice(1)} revenue target vs achieved</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Achieved: PKR {Number(recentPerformance?.revenue || 0).toLocaleString()}</span>
            <span>Target: PKR {Number(recentPerformance?.target || 0).toLocaleString()}</span>
          </div>
          <Progress value={recentPerformance?.progressPercent} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Commission Summary</CardTitle>
          <CardDescription>Your total commission from verified sales in this timeframe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">PKR {Number(commission || 0).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verified Sales</CardTitle>
          <CardDescription>List of your verified sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            {verifiedSales.map((sale) => (
              <div key={sale.id}>
                <p>Lead ID: {sale.leadId}</p>
                <p>Total Cost: PKR {sale.totalCost.toLocaleString()}</p>
                <p>Commission: PKR {(() => {
                  const { commission: c } = calculateCommission({
                    projectAmount: Number(sale.totalCost || 0),
                    advanceAmount: Number(sale.advanceAmount ?? 0),
                  });
                  return Number(c).toLocaleString();
                })()}</p>
                <p>Delivery Date: {new Date(sale.deliveryDate).toDateString()}</p>
                <p>Project Scope: {sale.projectScope}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        {dashboardContent}
      </div>
      
      <div className="md:w-80">
        <FollowUpsSidebar leads={upcomingLeads} />
      </div>
    </div>
  );
}
