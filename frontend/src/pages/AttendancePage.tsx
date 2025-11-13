import { KPICard } from "@/components/ui/kpi-card";
import { useState } from 'react';
// Use users from AuthContext (Supabase employees) instead of local EmployeesContext
import { useAttendance, AttendanceStatus } from '@/contexts/AttendanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const AttendancePage = () => {
  const { user, users } = useAuth();
  const today = new Date().toISOString().slice(0,10);
  const { records, addRecord, deleteRecord } = useAttendance();
  const [employeeId, setEmployeeId] = useState(user?.role === 'admin' ? (users?.[0]?.id || '') : (user?.id || ''));
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState<AttendanceStatus>('present');
  // Show only relevant records: admins see all; others see their own
  const visibleRecords = user?.role === 'admin' ? records : records.filter(r => r.employeeId === user?.id);
  // Simple KPIs based on visible records
  const presentCount = visibleRecords.filter(r => r.status === 'present').length;
  const absentCount = visibleRecords.filter(r => r.status === 'absent').length;
  const lateCount = visibleRecords.filter(r => r.status === 'late').length;

  const kpis = [
    {
      title: "Average Attendance (This Month)",
      value: visibleRecords.length ? `${Math.round((presentCount/visibleRecords.length)*100)}%` : 'N/A',
      change: 1,
      changeType: "positive" as const,
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      title: "Late Arrivals",
      value: lateCount,
      change: -10,
      changeType: "negative" as const,
      icon: <XCircle className="h-4 w-4" />,
    },
    {
      title: "Perfect Attendance",
      value: absentCount,
      change: 2,
      changeType: "positive" as const,
      icon: <CheckCircle className="h-4 w-4" />,
    },
  ];

  const handleAdd = () => {
    const targetEmployeeId = user?.role === 'admin' ? employeeId : (user?.id || '');
    if (!targetEmployeeId || !date) {
      alert('Please select employee and date');
      return;
    }
    addRecord({ employeeId: targetEmployeeId, date, status });
    setEmployeeId(user?.role === 'admin' ? '' : (user?.id || ''));
    setDate('');
    setStatus('present');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance Overview</h1>
        <p className="text-muted-foreground">Monitor employee presence and punctuality</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Add Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Add Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {user?.role === 'admin' ? (
              <select className="border rounded px-3 py-2" value={employeeId} onChange={e=>setEmployeeId(e.target.value)}>
                <option value="">Select Employee</option>
                {users?.map(emp=> (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            ) : (
              <Input value={user?.name || ''} disabled />
            )}
            <Input type="date" value={date} onChange={e=>setDate(e.target.value)} />
            <select className="border rounded px-3 py-2" value={status} onChange={e=>setStatus(e.target.value as AttendanceStatus)}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
            <Button onClick={handleAdd}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2">Employee</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map(rec=>{
                  const emp = users?.find(e=>String(e.id)===String(rec.employeeId));
                  return (
                    <tr key={rec.id} className="border-b">
                      <td className="py-2 px-2">{rec.date}</td>
                      <td className="py-2 px-2">{emp?.name || 'Unknown'}</td>
                      <td className="py-2 px-2 capitalize">{rec.status}</td>
                      <td className="py-2 px-2">
                        {(user?.role === 'admin' || rec.employeeId === user?.id) && (
                          <Button variant="destructive" size="sm" onClick={()=>deleteRecord(rec.id)}>Delete</Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {visibleRecords.length===0 && (
                  <tr><td className="py-4 px-2 text-center text-muted-foreground" colSpan={4}>No attendance records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { AttendancePage };
export default AttendancePage;
