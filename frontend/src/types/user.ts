export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'sales_executive' | 'sales_representative';
  status?: 'active' | 'inactive';
  joinDate?: string;
  salary?: number;          // monthly base salary in PKR
  commissionRate?: number;
  avatar?: string;  // percentage commission on verified sales
  /** Optional per-rep overrides of company settings */
  settingsOverride?: Partial<import('./index').CompanySettings>;
  paymentMethod?: string;
  accountNumber?: string;
}
