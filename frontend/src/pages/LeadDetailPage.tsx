import { useParams, useNavigate } from 'react-router-dom';
import { useLeads } from '@/contexts/LeadsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSales } from '@/contexts/SalesContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Activity, Lead } from '@/types';
import { useState } from 'react';

const LeadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { leads, updateLead } = useLeads();
  const { addSale } = useSales();
  const { user } = useAuth();
  const lead = leads.find(l => l.id === id);

  const [localLead, setLocalLead] = useState<Lead | undefined>(lead);
  const [newActivity, setNewActivity] = useState('');
  const [totalCost, setTotalCost] = useState<string>('');
  const [advanceAmount, setAdvanceAmount] = useState<string>('');
  const remaining = Math.max(0, Number(totalCost||0) - Number(advanceAmount||0));

  if (!lead) {
    return (
      <div className="p-6 space-y-4">
        <p>Lead not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const handleSave = () => {
    if (!localLead) return;
    updateLead(localLead.id, localLead);
    // If payment details filled, persist sale and mark as won
    if (totalCost) {
      const deliveryDate = (localLead as any).deliveryDate || null;
      addSale({
        leadId: localLead.id,
        clientName: localLead.clientName,
        projectName: localLead.projectName,
        totalCost: Number(totalCost),
        advanceAmount: Number(advanceAmount||0),
        deliveryDate: deliveryDate as any,
        projectScope: (localLead as any).projectScope || '',
        employeeId: localLead.employeeId,
      });
      updateLead(localLead.id, { status: 'won' as any });
    }
  };

  const addActivity = () => {
    if (!newActivity.trim()) return;
    const act: Activity = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      note: newActivity.trim(),
    };
    const updated = {
      ...localLead!,
      activities: [...(localLead?.activities || []), act],
    };
    setLocalLead(updated);
    setNewActivity('');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl mb-6 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <svg className="absolute -bottom-8 left-0 w-full h-24 text-white opacity-20" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M0,64L40,85.3C80,107,160,149,240,170.7C320,192,400,192,480,170.7C560,149,640,107,720,74.7C800,43,880,21,960,16C1040,11,1120,21,1200,42.7C1280,64,1360,96,1400,112L1440,128L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"></path>
        </svg>
        <div className="relative p-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white flex items-center space-x-2">
            <span>Lead Details</span>
          </h2>
          <Button variant="secondary" onClick={handleSave}>Save</Button>
        </div>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Client Name</label>
              <Input value={localLead?.clientName || ''} onChange={e => setLocalLead({ ...localLead!, clientName: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Project Name</label>
              <Input value={localLead?.projectName || ''} onChange={e => setLocalLead({ ...localLead!, projectName: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Phone</label>
              <Input 
                value={localLead?.phone || ''} 
                onChange={e => setLocalLead({ ...localLead!, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Address</label>
              <Textarea 
                value={localLead?.address || ''} 
                onChange={e => setLocalLead({ ...localLead!, address: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Estimated Value</label>
              <Input type="number" value={localLead?.estimatedValue || ''} onChange={e => setLocalLead({ ...localLead!, estimatedValue: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <Select value={localLead?.status} onValueChange={val => setLocalLead({ ...localLead!, status: val as Lead['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['new','contacted','negotiation','closed'].map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Follow-up Date</label>
              <DatePicker date={localLead?.followUpDate ? new Date(localLead.followUpDate) : null} onChange={d => setLocalLead({ ...localLead!, followUpDate: d?.toISOString().split('T')[0] })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Expected Close</label>
              <DatePicker date={localLead?.expectedCloseDate ? new Date(localLead.expectedCloseDate) : null} onChange={d => setLocalLead({ ...localLead!, expectedCloseDate: d?.toISOString() })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Total Deal (PKR)</label>
              <Input type="number" value={totalCost} onChange={e=>setTotalCost(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Advance (PKR)</label>
              <Input type="number" value={advanceAmount} onChange={e=>setAdvanceAmount(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Remaining (PKR)</label>
              <Input readOnly value={remaining.toLocaleString()} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">On Save, a sale record will be created and the lead will be marked as won.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Info & Client Response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Latest Info</label>
            <Textarea value={localLead?.latestInfo || ''} onChange={e => setLocalLead({ ...localLead!, latestInfo: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Client Response</label>
            <Textarea value={localLead?.clientResponse || ''} onChange={e => setLocalLead({ ...localLead!, clientResponse: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {(localLead?.activities || []).map(a => (
              <li key={a.id} className="text-sm flex space-x-2"><span className="text-muted-foreground">{new Date(a.date).toLocaleDateString()}</span><span>{a.note}</span></li>
            ))}
          </ul>
          <div className="flex space-x-2">
            <Input placeholder="Add activity note" value={newActivity} onChange={e => setNewActivity(e.target.value)} />
            <Button onClick={addActivity}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responsible Person</CardTitle>
        </CardHeader>
        <CardContent>
          <Input value={localLead?.responsibleEmployeeId || ''} onChange={e => setLocalLead({ ...localLead!, responsibleEmployeeId: e.target.value })} placeholder="Employee ID" />
          {localLead?.responsibleEmployeeId === user?.id && <p className="text-sm mt-2 text-muted-foreground">(You)</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadDetailPage;
