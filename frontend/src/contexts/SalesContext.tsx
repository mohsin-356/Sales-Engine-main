import { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { Sale } from '@/types/sale';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface SalesContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateSaleStatus: (saleId: string, status: 'verified' | 'rejected' | 'delivered') => Promise<void>;
  updateSale: (saleId: string, updates: Partial<Sale>) => Promise<void>;
  deleteSale: (saleId: string) => Promise<void>;
  refreshSales: () => Promise<void>;
  getSalesByEmployee: (employeeId: string) => Sale[];
  getPendingSales: () => Sale[];
  fetchSalesByEmployee: (employeeId: string) => Sale[];
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: React.ReactNode }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const { user, users } = useAuth();
  
  const refreshSales = useCallback(async () => {
    const rows = await api.get('/sales');
    const mapped: Sale[] = (rows || []).map((r: any) => ({
      id: String(r.id),
      leadId: r.lead_id ? String(r.lead_id) : undefined,
      clientName: r.client_name || undefined, // optional if you enrich joins later
      projectName: r.project_name || undefined,
      totalCost: Number(r.amount ?? 0),
      advanceAmount: Number(r.advance_amount ?? 0),
      deliveryDate: r.delivery_date || new Date().toISOString(),
      projectScope: r.project_scope || '',
      status: r.status,
      employeeId: r.sales_rep_id ? String(r.sales_rep_id) : undefined,
      createdAt: r.created_at || new Date().toISOString(),
    }));
    const withNames = mapped.map(s => {
      const match = users?.find(u => String(u.id) === String(s.employeeId));
      return match ? { ...s, employeeName: match.name } as Sale : s;
    });
    setSales(withNames);
  }, [users]);

  // Load/refetch when auth user changes (handles login/logout and RLS)
  useEffect(() => {
    refreshSales();
  }, [user, refreshSales]);

  const addSale = useCallback(async (sale: Omit<Sale, 'id' | 'createdAt' | 'status'>) => {
    if (!user?.id) return;
    const payload = {
      leadId: sale.leadId,
      amount: sale.totalCost,
      advanceAmount: sale.advanceAmount,
      status: 'pending_review',
      salesRepId: user.id,
      deliveryDate: sale.deliveryDate,
      projectScope: sale.projectScope,
    };
    const row = await api.post('/sales', payload);
    await refreshSales();
    return row;
  }, [user, refreshSales]);

  // Commission creation is handled via /api/commissions when needed

  const updateSaleStatus = useCallback(async (saleId: string, status: 'verified' | 'rejected' | 'delivered') => {
    if (status === 'delivered' && user?.role !== 'admin') return;
    await api.put(`/sales/${saleId}`, { status });
    await refreshSales();
  }, [user, refreshSales]);

  const getSalesByEmployee = useCallback((employeeId: string) => {
    return sales.filter(sale => sale.employeeId === employeeId);
  }, [sales]);

  const updateSale = useCallback(async (saleId: string, updates: Partial<Sale>) => {
    const payload: any = {
      leadId: updates.leadId,
      amount: updates.totalCost,
      advanceAmount: updates.advanceAmount,
      status: updates.status,
      salesRepId: updates.employeeId,
      deliveryDate: updates.deliveryDate,
      projectScope: updates.projectScope,
    };
    await api.put(`/sales/${saleId}`, payload);
    await refreshSales();
  },[refreshSales]);

  const deleteSale = useCallback(async (saleId: string) => {
    await api.delete(`/sales/${saleId}`);
    await refreshSales();
  }, [refreshSales]);

  const getPendingSales = useCallback(() => {
    return sales.filter(sale => sale.status === 'pending_review');
  }, [sales]);

  const fetchSalesByEmployee = useCallback((employeeId: string) => {
    const employeeSales = sales.filter(sale => sale.employeeId === employeeId);
    return employeeSales;
  }, [sales]);

  return (
    <SalesContext.Provider value={{
      sales,
      addSale,
      updateSaleStatus,
      updateSale,
      deleteSale,
      refreshSales,
      getSalesByEmployee,
      getPendingSales,
      fetchSalesByEmployee,
    }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
