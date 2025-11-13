import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lead, Activity } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface LeadsContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdDate'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  getLeadsByStatus: (status: Lead['status']) => Lead[];
  getLeadsByEmployee: (employeeId: string) => Lead[];
  refreshLeads: () => Promise<void>;
  fetchActivities: (leadId: string) => Promise<Activity[]>;
  addActivity: (leadId: string, note: string) => Promise<Activity>;
  deleteActivity: (leadId: string, activityId: string) => Promise<void>;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const LeadsProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const { user } = useAuth();

  const refreshLeads = async () => {
    const params = new URLSearchParams();
    if (user && user.role !== 'admin') params.set('employeeId', String(user.id));
    const rows = await api.get(`/leads${params.toString() ? `?${params.toString()}` : ''}`);
    const mapped: Lead[] = (rows || []).map((d: any) => ({
      id: String(d.id),
      clientName: d.client_name,
      projectName: d.project_name,
      estimatedValue: Number(d.estimated_value ?? 0),
      status: (d.status === 'closed' ? 'won' : d.status),
      followUpDate: d.follow_up_date ?? undefined,
      employeeId: d.employee_id ? String(d.employee_id) : undefined,
      createdDate: d.created_date ?? undefined,
      phone: d.phone ?? undefined,
      address: d.address ?? undefined,
      latestInfo: d.latest_info ?? undefined,
      clientResponse: d.client_response ?? undefined,
      expectedCloseDate: d.expected_close_date ?? undefined,
      source: d.source ?? undefined,
      priority: d.priority ?? undefined,
      score: d.score ?? undefined,
      probability: d.probability ?? undefined,
    }));
    setLeads(mapped);
  };

  // Initial load from backend
  useEffect(() => { refreshLeads().catch(console.error); }, []);

  const addLead = async (leadData: Omit<Lead, 'id' | 'createdDate'>) => {
    const payload = {
      clientName: leadData.clientName,
      projectName: leadData.projectName,
      estimatedValue: leadData.estimatedValue,
      status: leadData.status,
      followUpDate: leadData.followUpDate,
      employeeId: leadData.employeeId,
      phone: leadData.phone,
      address: leadData.address,
      latestInfo: leadData.latestInfo,
      clientResponse: leadData.clientResponse,
      expectedCloseDate: leadData.expectedCloseDate,
      source: leadData.source,
      priority: leadData.priority,
      score: leadData.score,
      probability: leadData.probability,
    };
    const row = await api.post('/leads', payload);
    const inserted: Lead = {
      id: String(row.id),
      clientName: row.client_name,
      projectName: row.project_name,
      estimatedValue: Number(row.estimated_value ?? 0),
      status: row.status,
      followUpDate: row.follow_up_date ?? undefined,
      employeeId: row.employee_id ? String(row.employee_id) : undefined,
      createdDate: row.created_date ?? undefined,
      phone: row.phone ?? undefined,
      address: row.address ?? undefined,
      latestInfo: row.latest_info ?? undefined,
    };
    await refreshLeads();
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const payload: any = { ...updates };
    if (updates.clientName) payload.clientName = updates.clientName;
    if (updates.projectName) payload.projectName = updates.projectName;
    if (updates.estimatedValue !== undefined) payload.estimatedValue = updates.estimatedValue;
    if (updates.status) payload.status = updates.status;
    if (updates.followUpDate) payload.followUpDate = updates.followUpDate;
    if (updates.employeeId) payload.employeeId = updates.employeeId as any;
    if (updates.phone) payload.phone = updates.phone;
    if (updates.address) payload.address = updates.address;
    if (updates.latestInfo) payload.latestInfo = updates.latestInfo;
    if (updates.clientResponse) payload.clientResponse = updates.clientResponse;
    if (updates.expectedCloseDate) payload.expectedCloseDate = updates.expectedCloseDate;
    if (updates.source) payload.source = updates.source;
    if (updates.priority) payload.priority = updates.priority;
    if (updates.score !== undefined) payload.score = updates.score;
    if (updates.probability !== undefined) payload.probability = updates.probability;
    const row = await api.put(`/leads/${id}`, payload);
    await refreshLeads();
  };

  const deleteLead = async (id: string) => {
    await api.delete(`/leads/${id}`);
    await refreshLeads();
  };

  const getLeadsByStatus = (status: Lead['status']) => {
    return leads.filter(lead => lead.status === status);
  };

  const getLeadsByEmployee = (employeeId: string) => {
    return leads.filter(lead => lead.employeeId === employeeId);
  };

  const fetchActivities = async (leadId: string): Promise<Activity[]> => {
    const rows = await api.get(`/leads/${leadId}/activities`);
    const acts: Activity[] = (rows || []).map((r: any) => ({ id: String(r.id), date: r.created_at, note: r.note }));
    return acts;
  };

  const addActivity = async (leadId: string, note: string): Promise<Activity> => {
    const row = await api.post(`/leads/${leadId}/activities`, { note });
    return { id: String(row.id), date: row.created_at, note: row.note } as Activity;
  };

  const deleteActivity = async (_leadId: string, activityId: string): Promise<void> => {
    await api.delete(`/leads/${_leadId}/activities/${activityId}`);
  };

  return (
    <LeadsContext.Provider value={{
      leads,
      addLead,
      updateLead,
      deleteLead,
      getLeadsByStatus,
      getLeadsByEmployee,
      refreshLeads,
      fetchActivities,
      addActivity,
      deleteActivity
    }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
};