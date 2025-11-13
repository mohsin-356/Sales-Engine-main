export type SaleStatus = 'pending_review' | 'verified' | 'rejected' | 'pending' | 'delivered';

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string; // ISO date
  completedAt?: string; // ISO timestamp when marked done
}

export interface Sale {
  id: string;
  leadId: string;
  clientName: string;
  projectName: string;
  totalCost: number;
  advanceAmount: number;
  deliveryDate: string; // ISO string
  projectScope: string;
  status: SaleStatus;
  employeeId: string; // the sales representative who closed the lead
  createdAt: string;
  expectedCompletionDate?: string;
  projectTeamIds?: string[];
  tasks?: Task[];
  cost?: number;
  expenses?: number;
  expectedProfit?: number; // admin visible
  commission?: number;
  employeeName?: string;
}
