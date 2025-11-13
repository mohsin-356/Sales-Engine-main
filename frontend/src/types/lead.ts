export type Lead = {
  id: string;
  clientName: string;
  projectName: string;
  estimatedValue: number;
  status: 'new' | 'contacted' | 'proposal' | 'won' | 'lost';
  followUpDate: string | null;
  latestInfo: string;
  employeeId: string;
  clientEmail?: string;
  phone?: string;
  address?: string;
};
