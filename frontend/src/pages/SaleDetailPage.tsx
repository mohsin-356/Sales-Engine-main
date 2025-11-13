import { useParams, useNavigate } from 'react-router-dom';
import { useSales } from '@/contexts/SalesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Task, Sale } from '@/types/sale';
import { useState } from 'react';

const SaleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sales, updateSale } = useSales();
  const { user, users } = useAuth();
  const { employees } = useEmployees();
  const sale = sales.find(s => s.id === id);

  const [localSale, setLocalSale] = useState<Sale | undefined>(sale);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState<Date | null>(null);

  if (!sale) {
    return (
      <div className="p-6 space-y-4">
        <p>Sale not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const handleSave = () => {
    if (!localSale) return;
    updateSale(localSale.id, localSale);
  };

  const getEmployeeName = (id?: string) => {
    if (!id) return '—';
    const fromUsers = users?.find(u => String(u.id) === String(id))?.name;
    if (fromUsers) return fromUsers;
    const fromEmployees = employees.find(e => String(e.id) === String(id))?.name;
    return fromEmployees ?? id;
  };

  const projectTeamNames = (localSale?.projectTeamIds || []).map(getEmployeeName).filter(Boolean).join(', ');

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle.trim(),
      status: 'todo',
      dueDate: newTaskDue ? newTaskDue.toISOString() : undefined,
    };
    const updated = {
      ...localSale!,
      tasks: [...(localSale?.tasks || []), task],
    };
    setLocalSale(updated);
    setNewTaskTitle('');
    setNewTaskDue(null);
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    const updated = {
      ...localSale!,
      tasks: (localSale?.tasks || []).map(t => {
        if (t.id !== taskId) return t;
        const updatedTask: Task = { ...t, status };
        if (status === 'done' && !t.completedAt) {
          updatedTask.completedAt = new Date().toISOString();
        }
        return updatedTask;
      })
    };
    setLocalSale(updated);
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
            <span>Sale Details</span>
          </h2>
          <Button variant="secondary" onClick={handleSave}>Save</Button>
        </div>
      </div>


      <Card>
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm text-muted-foreground">Employee</label>
            <div className="font-medium">{getEmployeeName(localSale?.employeeId)}</div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Total Cost</label>
            <Input type="number" value={localSale?.totalCost || 0} onChange={e => setLocalSale({ ...localSale!, totalCost: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Advance Amount</label>
            <Input type="number" value={localSale?.advanceAmount || 0} onChange={e => setLocalSale({ ...localSale!, advanceAmount: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Delivery Date</label>
            <DatePicker date={new Date(localSale!.deliveryDate)} onChange={d => setLocalSale({ ...localSale!, deliveryDate: d?.toISOString() || localSale!.deliveryDate })} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Expected Completion</label>
            <DatePicker date={localSale?.expectedCompletionDate ? new Date(localSale.expectedCompletionDate) : null} onChange={d => setLocalSale({ ...localSale!, expectedCompletionDate: d?.toISOString() })} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-muted-foreground">Project Scope</label>
            <Textarea value={localSale?.projectScope || ''} onChange={e => setLocalSale({ ...localSale!, projectScope: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Project Team</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm">{projectTeamNames || '—'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {(localSale?.tasks || []).length === 0 && <p className="text-sm text-muted-foreground">No tasks yet.</p>}
            {(localSale?.tasks || []).map(t => (
              <li key={t.id} className="flex items-center space-x-2 text-sm">
                <Select value={t.status} onValueChange={val => updateTaskStatus(t.id, val as Task['status'])}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['todo','in_progress','done'].map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
                <span className="flex-1">
                  {t.title}
                  {t.dueDate && (<span className="ml-2 text-xs text-muted-foreground">(due {new Date(t.dueDate).toLocaleDateString()})</span>)}
                  {t.completedAt && (<span className="ml-2 text-xs text-green-600">✔ {new Date(t.completedAt).toLocaleDateString()}</span>)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-2 md:space-y-0">
            <Input placeholder="Task title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
            <DatePicker date={newTaskDue} onChange={d=>setNewTaskDue(d)} placeholder="Due" />
            <Button onClick={addTask}>Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Financials */}
      <Card>
        <CardHeader><CardTitle>Financials</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Cost</label>
            <Input type="number" value={localSale?.cost || 0} onChange={e => setLocalSale({ ...localSale!, cost: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Expenses</label>
            <Input type="number" value={localSale?.expenses || 0} onChange={e => setLocalSale({ ...localSale!, expenses: Number(e.target.value) })} />
          </div>
          {user?.role === 'admin' && (
            <>
              <div>
                <label className="text-sm text-muted-foreground">Expected Profit</label>
                <Input type="number" value={localSale?.expectedProfit || 0} onChange={e => setLocalSale({ ...localSale!, expectedProfit: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Commission</label>
                <Input type="number" value={localSale?.commission || 0} onChange={e => setLocalSale({ ...localSale!, commission: Number(e.target.value) })} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SaleDetailPage;
