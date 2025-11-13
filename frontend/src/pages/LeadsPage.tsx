import { useState } from 'react';
import { useLeads } from '@/contexts/LeadsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSales } from '@/contexts/SalesContext';
import { Card } from '@/components/ui/card';
import { KPICard } from '@/components/ui/kpi-card';
import { RefreshButton } from '@/components/ui/refresh-button';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, TrendingUp, PlusCircle, FileText, Eye, Target, PhoneCall } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLeadMetrics } from '@/hooks/useLeadMetrics';
import { format, formatISO } from 'date-fns';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Lead } from '@/types';
import TimeFrameFilter, { TimeFrameFilterValue } from '@/components/ui/timeframe-filter';
import { createDatePredicate } from '@/utils/date';
import { EnhancedDatePicker } from '@/components/ui/EnhancedDatePicker';
import { SimpleDatePicker } from '@/components/ui/SimpleDatePicker';
import { ManualDateTimeInput } from '@/components/ui/ManualDateTimeInput';



  const getStatusColor = (status: Lead['status']) => {
  switch (status) {
    case 'new': return 'bg-blue-500 hover:bg-blue-600';
    case 'contacted': return 'bg-yellow-500 hover:bg-yellow-600';
    case 'proposal': return 'bg-purple-500 hover:bg-purple-600';
    case 'negotiation': return 'bg-orange-500 hover:bg-orange-600';
    case 'won': return 'bg-green-500 hover:bg-green-600';
    case 'lost': return 'bg-red-500 hover:bg-red-600';
    default: return 'bg-gray-500 hover:bg-gray-600';
  }
};

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const statusStyles = {
  new: { headerBg: 'bg-blue-50', border: 'border-blue-500' },
  contacted: { headerBg: 'bg-yellow-50', border: 'border-yellow-500' },
  proposal: { headerBg: 'bg-purple-50', border: 'border-purple-500' },
  negotiation: { headerBg: 'bg-orange-50', border: 'border-orange-500' },
  won: { headerBg: 'bg-green-50', border: 'border-green-500' },
  lost: { headerBg: 'bg-red-50', border: 'border-red-500' },
} as const;

type StatusKey = keyof typeof statusStyles;
const getStatusBorder = (status: Lead['status']) => {
  const s = (statusStyles as any)[status];
  return s?.border ?? 'border-gray-300';
};

export const LeadsPage = () => {
  const { user } = useAuth();
  const { leads, addLead, updateLead, deleteLead, getLeadsByEmployee, refreshLeads } = useLeads();
  const { addSale } = useSales();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  interface LeadFormData {
  clientName: string;
  projectName: string;
  estimatedValue: string;
  status: Lead['status'];
  followUpDate: Date | null;
  latestInfo: string;
  phone: string;
  phoneType: 'mobile' | 'landline';
  address: string;
}

  const [formData, setFormData] = useState<LeadFormData>({
    clientName: '',
    projectName: '',
    estimatedValue: '',
    status: 'new' as Lead['status'],
    followUpDate: null,
    latestInfo: '',
    phone: '',
    phoneType: 'mobile',
    address: '',
  });

  const handleChange = (field: keyof LeadFormData, value: LeadFormData[keyof LeadFormData]) => {
    // Special handling for date changes to ensure proper typing
    if (field === 'followUpDate') {
      setFormData(prev => ({
        ...prev,
        followUpDate: value as Date | null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // ----- Time frame filter state -----
  const [tfFilter, setTfFilter] = useState<TimeFrameFilterValue>({ timeframe: 'daily' });
  

  let baseLeads = (user && user.role !== 'admin')
    ? getLeadsByEmployee(user.id)
    : leads;
  // apply time frame predicate
  const datePred = createDatePredicate(tfFilter.timeframe,
  tfFilter.customStart ? new Date(tfFilter.customStart) : undefined,
  tfFilter.customEnd ? new Date(tfFilter.customEnd) : undefined);
  baseLeads = baseLeads.filter(l => datePred(new Date(l.createdDate)));
  const userLeads = baseLeads;

  // ----- Real-time KPI calculations -----
  const totalLeads = userLeads.length;
  const openLeads = userLeads.filter(l => l.status === 'new' || l.status === 'contacted' || l.status === 'proposal').length;
  const negotiationLeads = userLeads.filter(l => l.status === 'negotiation').length;
  const wonLeads = userLeads.filter(l => l.status === 'won').length;
  const conversionRate = totalLeads ? (wonLeads / totalLeads * 100).toFixed(1) : '0';

  const {
    todayLeads,
    monthLeads,
    dailyTarget,
    monthlyTarget,
    dailyProgress,
    monthlyProgress,
    statusCount,
  } = useLeadMetrics();

  const kpis = [
    { title: 'Open Leads', value: openLeads, icon: <PlusCircle className="h-4 w-4" /> },
    { title: 'Negotiation', value: negotiationLeads, icon: <FileText className="h-4 w-4" /> },
    { title: 'Conversion Rate', value: `${conversionRate}%`, icon: <TrendingUp className="h-4 w-4" /> },
    { title: 'Leads Today', value: `${todayLeads}/${dailyTarget}`, icon: <Target className="h-4 w-4" /> },
    { title: 'Leads This Month', value: `${monthLeads}/${monthlyTarget}`, icon: <CalendarIcon className="h-4 w-4" /> },
  ];

  const [sortOption, setSortOption] = useState<'createdNewest' | 'createdOldest' | 'followUp'>('createdNewest');

  const filteredLeads = (statusFilter: string) => {
    let list = statusFilter === 'all' ? userLeads : userLeads.filter(l => l.status === statusFilter);
    switch (sortOption) {
      case 'createdOldest':
        list = [...list].sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());
        break;
      case 'followUp':
        list = [...list].sort((a, b) => (a.followUpDate || '').localeCompare(b.followUpDate || ''));
        break;
      default:
        list = [...list].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    }
    return list;
  };

  const renderLeadsList = (list: Lead[]) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {list.map(lead => (
        <Card key={lead.id} className={`p-4 border-l-4 hover:shadow-md hover:-translate-y-0.5 transition-transform transition-shadow rounded-lg ${getStatusBorder(lead.status)}`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm font-poppins">{lead.clientName}</h4>
              <div className="flex space-x-1">
                <Link to={`/leads/${lead.id}`} className="p-1 rounded-full text-primary hover:bg-primary/10 hover:scale-105 transition-transform">
                  <Eye className="h-4 w-4" />
                </Link>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(lead)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleRequestDelete(lead)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
                {lead.status !== 'won' && lead.status !== 'lost' && (
                  <Button size="sm" variant="ghost" onClick={() => handleCloseLead(lead)}>
                    Close Lead
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-poppins">{lead.projectName}</p>
            <p className="text-sm font-semibold font-poppins">PKR {lead.estimatedValue.toLocaleString()}</p>
            {lead.followUpDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {lead.followUpDate}
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center justify-end">
                <Button size="sm" variant="ghost" onClick={()=>{
                  const d = (lead.phone||'').replace(/\D/g,'');
                  const wa = d.startsWith('92') ? d : (d.startsWith('0') ? `92${d.substring(1)}` : `92${d}`);
                  window.open(`https://wa.me/${wa}`, '_blank');
                }}>
                  <PhoneCall className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new Date object to ensure proper serialization
    let followUpDateISO = null;
    if (formData.followUpDate) {
      const date = new Date(formData.followUpDate);
      followUpDateISO = date.toISOString();
    }

    const onlyDigits = (s: string) => s.replace(/\D/g, '');
    const normalizePkPhone = (raw: string, type: 'mobile'|'landline') => {
      const d = onlyDigits(raw);
      if (type === 'mobile') {
        if (/^0?3\d{9}$/.test(d)) {
          const local = d.startsWith('0') ? d.slice(1) : d; // 3XXXXXXXXX
          return { e164: `+92${local}`, wa: `92${local}` };
        }
        if (/^92?3\d{9}$/.test(d)) {
          const local = d.startsWith('92') ? d.slice(2) : d;
          return { e164: `+92${local}`, wa: `92${local}` };
        }
        return null;
      } else {
        if (/^0\d{9,10}$/.test(d)) {
          const local = d.slice(1);
          return { e164: `+92${local}`, wa: `92${local}` };
        }
        if (/^92\d{9,10}$/.test(d)) {
          const local = d.slice(2);
          return { e164: `+92${local}`, wa: `92${local}` };
        }
        return null;
      }
    };

    const norm = normalizePkPhone(formData.phone, formData.phoneType);
    if (!norm) {
      alert('Invalid phone number format');
      return;
    }

    const submissionData = {
      ...formData,
      followUpDate: followUpDateISO,
      estimatedValue: Number(formData.estimatedValue),
      phone: norm.e164,
    };

    if (editingLead) {
      updateLead(editingLead.id, submissionData);
      setEditingLead(null);
    } else {
      addLead({
        ...submissionData,
        employeeId: user?.id || ''
      });
    }
    
    // Reset form
    setFormData({
      clientName: '',
      projectName: '',
      estimatedValue: '',
      status: 'new',
      followUpDate: null,
      latestInfo: '',
      phone: '',
      phoneType: 'mobile',
      address: '',
    });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      clientName: lead.clientName,
      projectName: lead.projectName,
      estimatedValue: lead.estimatedValue.toString(),
      status: lead.status,
      followUpDate: lead.followUpDate ? new Date(lead.followUpDate) : null,
      latestInfo: lead.latestInfo || '',
      phone: lead.phone || '',
      phoneType: ((lead.phone||'').replace(/\D/g,'').startsWith('3') || (lead.phone||'').startsWith('+923')) ? 'mobile' : 'landline',
      address: lead.address || '',
    });
    setIsAddDialogOpen(true);
  };

  const handleCloseLead = (lead: Lead) => {
    setIsCloseLeadDialogOpen(true);
    setCurrentLead(lead);
  };

  const [isCloseLeadDialogOpen, setIsCloseLeadDialogOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [saleDetails, setSaleDetails] = useState({
    totalCost: '',
    advanceAmount: '',
    deliveryDate: '',
    projectScope: '',
  });

  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  const handleRequestDelete = (lead: Lead) => {
    setDeletingLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingLead) {
      deleteLead(deletingLead.id);
      setDeletingLead(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeletingLead(null);
  };

  const handleSaleSubmit = () => {
    if (currentLead) {
      const deliveryDate = saleDetails.deliveryDate ? formatISO(new Date(saleDetails.deliveryDate), { representation: 'date' }) : null;
      updateLead(currentLead.id, { 
        status: 'won'
      });
      addSale({
        leadId: currentLead.id,
        clientName: currentLead.clientName,
        projectName: currentLead.projectName,
        totalCost: Number(saleDetails.totalCost),
        advanceAmount: Number(saleDetails.advanceAmount),
        deliveryDate: deliveryDate,
        projectScope: saleDetails.projectScope,
        employeeId: user.id,
      });
      setSaleDetails({ totalCost: '', advanceAmount: '', deliveryDate: '', projectScope: '' });
      setIsCloseLeadDialogOpen(false);
    }
  };

  const [showFollowUpReminders, setShowFollowUpReminders] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">Lead Management</h1>
          <p className="text-muted-foreground font-poppins">
            Track and manage your sales pipeline
          </p>
        </div>
        <RefreshButton onRefresh={refreshLeads} />
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Lead
            </Button>
          </DialogTrigger>
          <DialogContent onInteractOutside={(e) => e.preventDefault()} className="w-full sm:max-w-xl md:max-w-2xl bg-gradient-to-br from-blue-50 to-purple-50 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="font-poppins">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => handleChange('clientName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={formData.projectName}
                      onChange={(e) => handleChange('projectName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedValue">Estimated Value (PKR)</Label>
                    <Input
                      id="estimatedValue"
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => handleChange('estimatedValue', e.target.value.toString())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange('status', value as Lead['status'])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Follow-up Date & Time</Label>
                  <ManualDateTimeInput
                    value={formData.followUpDate}
                    onChange={(date) => handleChange('followUpDate', date)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latestInfo">Latest Information</Label>
                  <textarea
                    id="latestInfo"
                    value={formData.latestInfo || ''}
                    onChange={(e) => handleChange('latestInfo', e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={formData.phoneType} onValueChange={(v)=>handleChange('phoneType', v as any)}>
                      <SelectTrigger className="col-span-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="landline">Landline</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      className="col-span-2"
                      placeholder={formData.phoneType==='mobile' ? '03XXXXXXXXX' : '0XXXXXXXXXX'}
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <textarea
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingLead(null);
                  setFormData({
                    clientName: '',
                    projectName: '',
                    estimatedValue: '',
                    status: 'new',
                    followUpDate: null,
                    latestInfo: '',
                    phone: '',
                    phoneType: 'mobile',
                    address: '',
                  });
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLead ? 'Update' : 'Add'} Lead
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map(kpi => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
          />
        ))}
      </div>

      {user?.role !== 'sales_representative' && showFollowUpReminders && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Upcoming Follow-ups</h3>
            <button 
              onClick={() => setShowFollowUpReminders(!showFollowUpReminders)}
              className="text-sm text-blue-600"
            >
              {showFollowUpReminders ? 'Hide' : 'Show'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads
              .filter(lead => lead.followUpDate && new Date(lead.followUpDate) > new Date())
              .sort((a, b) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime())
              .map(lead => (
                <div key={lead.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{lead.clientName}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{lead.projectName}</p>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">Follow up: </span>
                    <span className="font-medium">
                      {format(new Date(lead.followUpDate), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <TimeFrameFilter value={tfFilter} onChange={setTfFilter} />
          <Select
            value={sortOption}
            onValueChange={(v) => setSortOption(v as 'createdNewest' | 'createdOldest' | 'followUp')}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdNewest">Newest Created</SelectItem>
              <SelectItem value="createdOldest">Oldest Created</SelectItem>
              <SelectItem value="followUp">Follow-up Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <h2 className="text-2xl font-bold mb-2 font-poppins">Generated Leads</h2>
          <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            {statusFilters.map((f) => (
              <TabsTrigger key={f.value} value={f.value} className="capitalize">
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {statusFilters.map((f) => (
            <TabsContent key={f.value} value={f.value}>
              {renderLeadsList(filteredLeads(f.value))}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={isCloseLeadDialogOpen} onOpenChange={setIsCloseLeadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Lead</DialogTitle>
            <DialogDescription>
              Please provide the sale details to close this lead.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalCost" className="text-right">
                Total Cost
              </Label>
              <Input
                id="totalCost"
                type="number"
                value={saleDetails.totalCost}
                onChange={(e) => setSaleDetails({ ...saleDetails, totalCost: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="advanceAmount" className="text-right">
                Advance Amount
              </Label>
              <Input
                id="advanceAmount"
                type="number"
                value={saleDetails.advanceAmount}
                onChange={(e) => setSaleDetails({ ...saleDetails, advanceAmount: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3 text-sm text-muted-foreground">
                Remaining: PKR {Math.max(0, Number(saleDetails.totalCost||0) - Number(saleDetails.advanceAmount||0)).toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deliveryDate" className="text-right">
                Delivery Date
              </Label>
              <Input
                type="date"
                value={saleDetails.deliveryDate}
                onChange={(e) => setSaleDetails({ ...saleDetails, deliveryDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectScope" className="text-right">
                Project Scope
              </Label>
              <Input
                id="projectScope"
                value={saleDetails.projectScope}
                onChange={(e) => setSaleDetails({ ...saleDetails, projectScope: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseLeadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaleSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Lead Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead
              {deletingLead ? ` "${deletingLead.clientName}"` : ''} and remove its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};