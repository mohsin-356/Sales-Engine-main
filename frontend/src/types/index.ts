export type UserRole = 'admin' | 'sales_executive' | 'sales_representative';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'terminated';
  joinDate: string;
  avatar?: string;
  /** Optional per-rep overrides of company settings */
  settingsOverride?: Partial<CompanySettings>;
  paymentMethod?: string;
  accountNumber?: string;
}

export interface Sale {
  id: string;
  clientName: string;
  projectName: string;
  invoiceAmount: number;
  paymentReceived: number;
  date: string;
  employeeId: string;
  isConfirmed: boolean; // >= 50% payment received
}

export interface Activity {
  id: string;
  date: string; // ISO
  note: string;
}

export interface Lead {
  id: string;
  clientName: string;
  projectName: string;
  estimatedValue: number;
  status: 'new' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';
  followUpDate?: string | null;
  latestInfo?: string;
  clientResponse?: string;
  clientEmail?: string;
  phone?: string;
  address?: string;
  responsibleEmployeeId?: string;
  expectedCloseDate?: string;
  // New CRM fields
  source?: string; // e.g., website, referral, ads
  priority?: 'low' | 'medium' | 'high';
  score?: number; // lead score
  probability?: number; // 0-100
  activities?: Activity[];
  employeeId: string;
  createdDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'late' | 'absent' | 'friday_off';
}

export interface PayrollCalculation {
  employeeId: string;
  month: string;
  year: number;
  baseSalary: number;
  daysWorked: number;
  totalDays: number;
  confirmedSales: number;
  projectBonuses: number;
  tieredBonuses: number;
  deductions: number;
  netPay: number;
  status: 'pending' | 'paid';
  paidDate?: string;
}

export interface CompanySettings {
  baseSalary: number;
  salesTarget: number;
  revenueTarget: number;
  weeklyRevenueTarget: number;
  monthlyRevenueTarget: number;
  yearlyRevenueTarget: number;
  dailyLeadTarget: number;
  monthlyLeadTarget: number;
  projectBonusThreshold: number;
  projectBonusRate: number;
  deductionPerMissedSale: number;
  tieredBonusRates: {
    tier1: { min: number; max: number; amount: number }; // Sales 13-15: 2000
    tier2: { min: number; max: number; amount: number }; // Sales 16-20: 3000
    tier3: { min: number; max: number; amount: number }; // Sales 21-25: 4000
    tier4: { min: number; amount: number }; // Sales 26+: 6000
  };
  /** Payment window description, e.g. "Paid 1st-7th next month" */
  paymentSchedule: string;
  /** Working hours description, e.g. "9 AM-6 PM Mon-Sat. Fridays off" */
  workingHours: string;
}

export interface KPICard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
}