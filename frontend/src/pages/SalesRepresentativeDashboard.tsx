import { KPICard } from '@/components/ui/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp, Clock, Plus } from 'lucide-react';
import { FollowUpCard } from '@/components/dashboard/FollowUpCard';
import { useLeads } from '@/hooks/useLeads';
import { useSales } from '@/contexts/SalesContext';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for sales representative
const mockKPIs = [
  { title: 'Leads Created', value: 24, change: 15, changeType: 'positive' as const, icon: <Users className="h-4 w-4" /> },
  { title: 'Deals Closed', value: 8, change: 33, changeType: 'positive' as const, icon: <Target className="h-4 w-4" /> },
  { title: 'Conversion Rate', value: '33.3%', change: 5, changeType: 'positive' as const, icon: <TrendingUp className="h-4 w-4" /> },
  { title: 'Pending Follow-ups', value: 6, change: -20, changeType: 'positive' as const, icon: <Clock className="h-4 w-4" /> }
];

const mockLeads = [
  { 
    id: '1', 
    clientName: 'Tech Solutions Inc', 
    projectName: 'CRM System', 
    estimatedValue: 150000, 
    status: 'negotiation', 
    followUpDate: '2025-07-28T10:00:00'
  },
  { 
    id: '2', 
    clientName: 'Retail Chain', 
    projectName: 'POS System', 
    estimatedValue: 80000, 
    status: 'contacted', 
    followUpDate: '2025-07-29T14:30:00'
  },
  { 
    id: '3', 
    clientName: 'Restaurant Group', 
    projectName: 'Ordering App', 
    estimatedValue: 120000, 
    status: 'new', 
    followUpDate: '2024-07-26T10:00:00'
  },
  { 
    id: '4', 
    clientName: 'Healthcare Clinic', 
    projectName: 'Patient Portal', 
    estimatedValue: 200000, 
    status: 'negotiation', 
    followUpDate: '2024-07-23T14:30:00'
  }
];

const mockFollowUps = [
  { id: '1', client: 'Healthcare Clinic', task: 'Demo presentation', dueDate: '2024-07-23', priority: 'high' },
  { id: '2', client: 'Tech Solutions Inc', task: 'Proposal review', dueDate: '2024-07-25', priority: 'medium' },
  { id: '3', client: 'Retail Chain', task: 'Requirements gathering', dueDate: '2024-07-24', priority: 'high' },
  { id: '4', client: 'Restaurant Group', task: 'Initial contact', dueDate: '2024-07-26', priority: 'low' }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-blue-500';
    case 'contacted': return 'bg-yellow-500';
    case 'negotiation': return 'bg-orange-500';
    case 'closed': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'default';
  }
};

export const SalesRepresentativeDashboard = () => {
  const { leads } = useLeads();
  const { sales } = useSales();

  // Filter upcoming follow-ups (next 7 days)
  const upcomingFollowUps = leads.filter(lead => 
    lead.followUpDate && 
    new Date(lead.followUpDate) > new Date() &&
    new Date(lead.followUpDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  // Calculate real-time metrics
  const totalLeads = leads.length;
  const convertedLeads = sales.length;
  const totalCommission = sales.reduce((sum, sale) => sum + (sale.totalCost * 0.1), 0); // 10% commission

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Representative Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your leads and track performance
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Lead
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockKPIs.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lead Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Follow-up</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.clientName}</TableCell>
                    <TableCell>{lead.projectName}</TableCell>
                    <TableCell>PKR {lead.estimatedValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.followUpDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Follow-up Reminders */}
        <Card>
          <CardHeader>
            <CardTitle>Follow-up Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockFollowUps.map((followUp) => (
                <div key={followUp.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{followUp.client}</h4>
                    <Badge variant={getPriorityVariant(followUp.priority)}>
                      {followUp.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{followUp.task}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Due: {followUp.dueDate}</span>
                    <Button size="sm" variant="outline">Mark Done</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-1">
          <h3 className="text-lg font-medium mb-4">Upcoming Follow-ups</h3>
          <div className="space-y-4">
            {upcomingFollowUps.map(lead => (
              <FollowUpCard
                key={lead.id}
                clientName={lead.clientName}
                projectName={lead.projectName}
                followUpDate={new Date(lead.followUpDate)}
                estimatedValue={lead.estimatedValue}
                status={lead.status}
              />
            ))}
          </div>
        </div>
        
        <div className="col-span-1">
          <h3 className="text-lg font-medium mb-4">Commission Breakdown</h3>
          <Card className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="clientName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalCost" name="Sale Amount" fill="#8884d8" />
                <Bar dataKey="totalCost" name="Commission" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="col-span-1">
          <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
          <div className="grid gap-4">
            <Card className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Total Leads</h4>
              <p className="text-2xl font-bold">{totalLeads}</p>
            </Card>
            <Card className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Converted Leads</h4>
              <p className="text-2xl font-bold">{convertedLeads}</p>
            </Card>
            <Card className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Total Commission</h4>
              <p className="text-2xl font-bold">{totalCommission.toLocaleString()} PKR</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">24</div>
              <div className="text-sm text-muted-foreground">Total Leads Created</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-accent">8</div>
              <div className="text-sm text-muted-foreground">Deals Closed This Month</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-warning">33.3%</div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};