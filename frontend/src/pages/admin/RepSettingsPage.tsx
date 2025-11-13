import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


/**
 * RepSettingsPage – Admin tool to view & edit per-rep overrides of company settings.
 *
 * This page lists all users (sales reps / execs). Selecting a user reveals editable
 * fields (base salary, sales & revenue targets, commission rate, deduction per missed sale).
 * The form values default to the company's settings but can be overridden and saved per-rep.
 * Overrides are stored in the user's `settingsOverride` property and picked up by
 * `useRepSettings` across the app – ensuring real-time updates.
 */
export default function RepSettingsPage() {
  const { users, updateUser } = useAuth();
  const { settings: company } = useSettings();

  const [selectedId, setSelectedId] = useState<string>('');

  const selectedUser = users.find(u => u.id === selectedId);

  // Local form state initialised lazily when a user is selected
  const [formData, setFormData] = useState({
    baseSalary: company.baseSalary,
    salesTarget: company.salesTarget,
    revenueTarget: company.revenueTarget,
    commissionRate: company.projectBonusRate, // using projectBonusRate as commission substitute
    deductionPerMissedSale: company.deductionPerMissedSale,
  });

  const loadUser = (userId: string) => {
    setSelectedId(userId);
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const overrides = user.settingsOverride ?? {};
    setFormData({
      baseSalary: overrides.baseSalary ?? company.baseSalary,
      salesTarget: overrides.salesTarget ?? company.salesTarget,
      revenueTarget: overrides.revenueTarget ?? company.revenueTarget,
      commissionRate: overrides.projectBonusRate ?? company.projectBonusRate,
      deductionPerMissedSale: overrides.deductionPerMissedSale ?? company.deductionPerMissedSale,
    });
  };

  const handleChange = (field: keyof typeof formData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!selectedUser) return;
    updateUser({
      ...selectedUser,
      settingsOverride: {
        ...(selectedUser.settingsOverride ?? {}),
        baseSalary: formData.baseSalary,
        salesTarget: formData.salesTarget,
        revenueTarget: formData.revenueTarget,
        projectBonusRate: formData.commissionRate,
        deductionPerMissedSale: formData.deductionPerMissedSale,
      },
    });
  };

  const handleReset = () => {
    if (!selectedUser) return;
    updateUser({
      ...selectedUser,
      settingsOverride: undefined, // remove overrides
    });
    loadUser(selectedUser.id); // reload default values
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold font-poppins">Rep Settings Overrides</h1>
      <p className="text-muted-foreground font-poppins">Manage per-representative overrides of company compensation settings.</p>

      {/* User selector */}
      <div className="max-w-xs">
        <Label htmlFor="rep">Select Representative</Label>
        <select id="rep" className="border rounded p-2 w-full" value={selectedId} onChange={e => loadUser(e.target.value)}>
          <option value="" disabled>Select…</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="font-poppins">Override Settings for {selectedUser.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseSalary">Base Salary (PKR)</Label>
                <Input id="baseSalary" type="number" value={formData.baseSalary}
                  onChange={e => handleChange('baseSalary', Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="salesTarget">Monthly Sales Target</Label>
                <Input id="salesTarget" type="number" value={formData.salesTarget}
                  onChange={e => handleChange('salesTarget', Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="revenueTarget">Monthly Revenue Target</Label>
                <Input id="revenueTarget" type="number" value={formData.revenueTarget}
                  onChange={e => handleChange('revenueTarget', Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="commissionRate">Project Bonus Rate (%)</Label>
                <Input id="commissionRate" type="number" step="0.01" value={formData.commissionRate * 100}
                  onChange={e => handleChange('commissionRate', Number(e.target.value) / 100)} />
              </div>
              <div>
                <Label htmlFor="deduction">Deduction per Missed Sale</Label>
                <Input id="deduction" type="number" value={formData.deductionPerMissedSale}
                  onChange={e => handleChange('deductionPerMissedSale', Number(e.target.value))} />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSave}>Save Overrides</Button>
              <Button variant="outline" onClick={handleReset}>Reset to Company Defaults</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
