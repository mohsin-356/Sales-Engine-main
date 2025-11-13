import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface Employee {
  id: string;
  name: string;
  employeeNumber: string;
  address: string;
  contact: string;
  salary: number;
  role: string;
  status: string;
}

interface EmployeesContextType {
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'role' | 'status'> & Partial<Pick<Employee,'role'|'status'>>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
}

const EmployeesContext = createContext<EmployeesContextType>({} as EmployeesContextType);

export const EmployeesProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { users } = useAuth();

  useEffect(() => {
    // Map AuthContext users into Employee shape where possible
    const mapped: Employee[] = (users || []).map((u: any) => ({
      id: String(u.id),
      name: u.name,
      employeeNumber: '',
      address: '',
      contact: '',
      salary: 0,
      role: u.role,
      status: u.status,
    }));
    setEmployees(mapped);
  }, [users]);

  const addEmployee = async (emp: Omit<Employee, 'id' | 'role' | 'status'> & Partial<Pick<Employee,'role'|'status'>>) => {
    const payload = {
      name: emp.name,
      email: `${emp.name?.toLowerCase().replace(/\s+/g,'')}@example.com`,
      role: emp.role ?? 'sales_representative',
      status: emp.status ?? 'active',
      password: 'password',
    };
    const row = await api.post('/users', payload);
    const inserted: Employee = {
      id: String(row.id),
      name: row.name,
      employeeNumber: emp.employeeNumber || '',
      address: emp.address || '',
      contact: emp.contact || '',
      salary: emp.salary || 0,
      role: row.role,
      status: row.status,
    };
    setEmployees(prev => [...prev, inserted]);
  };

  const deleteEmployee = async (id: string) => {
    await api.delete(`/users/${id}`);
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  return (
    <EmployeesContext.Provider value={{ employees, addEmployee, deleteEmployee }}>
      {children}
    </EmployeesContext.Provider>
  );
};

export const useEmployees = () => {
  const ctx = useContext(EmployeesContext);
  if (!ctx) throw new Error('useEmployees must be used within EmployeesProvider');
  return ctx;
};
