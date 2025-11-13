import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // ISO date string yyyy-mm-dd
  status: AttendanceStatus;
}

interface AttendanceContextType {
  records: AttendanceRecord[];
  addRecord: (rec: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  getRecordsByEmployee: (employeeId: string) => AttendanceRecord[];
  refresh: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType>({} as AttendanceContextType);

const STORAGE_KEY = undefined as unknown as string; // no local storage anymore

export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const { user } = useAuth();

  // no local persistence

  const refresh = useCallback(async () => {
    const rows = await api.get('/attendance');
    const mapped: AttendanceRecord[] = (rows || []).map((r: any) => ({
      id: String(r.id),
      employeeId: String(r.employee_id),
      date: r.date,
      status: r.status,
    }));
    setRecords(mapped);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // No realtime in dummy mode

  const addRecord = useCallback(async (rec: Omit<AttendanceRecord, 'id'>) => {
    await api.post('/attendance', { employeeId: rec.employeeId, date: rec.date, status: rec.status });
    await refresh();
  }, [refresh]);

  const deleteRecord = useCallback(async (id: string) => {
    await api.delete(`/attendance/${id}`);
    await refresh();
  }, [refresh]);

  const getRecordsByEmployee = (employeeId: string) => records.filter(r => r.employeeId === employeeId);

  return (
    <AttendanceContext.Provider value={{ records, addRecord, deleteRecord, getRecordsByEmployee, refresh }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error('useAttendance must be used within AttendanceProvider');
  return ctx;
};
