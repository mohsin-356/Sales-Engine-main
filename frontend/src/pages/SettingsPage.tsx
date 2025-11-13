import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw } from 'lucide-react';

export const SettingsPage = () => {
  const { settings, updateSettings, resetToDefaults } = useSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState(settings);

  const handleSave = () => {
    updateSettings(formData);
    toast({
      title: "Settings Updated",
      description: "Company settings have been successfully updated.",
    });
  };

  const handleReset = () => {
    resetToDefaults();
    setFormData(settings);
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    const isText = field === 'paymentSchedule' || field === 'workingHours';
    setFormData(prev => ({
      ...prev,
      [field]: isText ? String(value) : Number(value)
    }));
  };

  const handleTierChange = (tier: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      tieredBonusRates: {
        ...prev.tieredBonusRates,
        [tier]: {
          ...prev.tieredBonusRates[tier as keyof typeof prev.tieredBonusRates],
          [field]: Number(value)
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">Company Settings</h1>
          <p className="text-muted-foreground font-poppins">
            Configure payroll rules, bonuses, and company policies
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-poppins">Basic Salary & Targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="baseSalary">Base Salary (PKR)</Label>
              <Input
                id="baseSalary"
                type="number"
                value={formData.baseSalary}
                onChange={(e) => handleInputChange('baseSalary', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="salesTarget">Monthly Sales Target</Label>
              <Input
                id="salesTarget"
                type="number"
                value={formData.salesTarget}
                onChange={(e) => handleInputChange('salesTarget', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="revenueTarget">Monthly Revenue Target (PKR)</Label>
              <Input
                id="revenueTarget"
                type="number"
                value={formData.revenueTarget}
                onChange={(e) => handleInputChange('revenueTarget', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Project Bonus Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-poppins">Project Bonus Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectBonusThreshold">Minimum Project Value for Bonus (PKR)</Label>
              <Input
                id="projectBonusThreshold"
                type="number"
                value={formData.projectBonusThreshold}
                onChange={(e) => handleInputChange('projectBonusThreshold', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="projectBonusRate">Project Bonus Rate (%)</Label>
              <Input
                id="projectBonusRate"
                type="number"
                step="0.01"
                value={formData.projectBonusRate * 100}
                onChange={(e) => handleInputChange('projectBonusRate', Number(e.target.value) / 100)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Currently {(formData.projectBonusRate * 100)}% of project value
              </p>
            </div>
            <div>
              <Label htmlFor="deductionPerMissedSale">Deduction per Missed Sale (PKR)</Label>
              <Input
                id="deductionPerMissedSale"
                type="number"
                value={formData.deductionPerMissedSale}
                onChange={(e) => handleInputChange('deductionPerMissedSale', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tiered Bonus Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-poppins">Tiered Bonus Structure</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure bonus amounts for different sales achievement tiers
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Tier 1 */}
              <div className="space-y-4">
                <h4 className="font-semibold font-poppins">Tier 1 (Sales 13-15)</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="tier1Min">Min Sales</Label>
                    <Input
                      id="tier1Min"
                      type="number"
                      value={formData.tieredBonusRates.tier1.min}
                      onChange={(e) => handleTierChange('tier1', 'min', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tier1Max">Max Sales</Label>
                    <Input
                      id="tier1Max"
                      type="number"
                      value={formData.tieredBonusRates.tier1.max}
                      onChange={(e) => handleTierChange('tier1', 'max', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tier1Amount">Bonus (PKR)</Label>
                    <Input
                      id="tier1Amount"
                      type="number"
                      value={formData.tieredBonusRates.tier1.amount}
                      onChange={(e) => handleTierChange('tier1', 'amount', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Tier 2 */}
              <div className="space-y-4">
                <h4 className="font-semibold font-poppins">Tier 2 (Sales 16-20)</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="tier2Min">Min Sales</Label>
                    <Input
                      id="tier2Min"
                      type="number"
                      value={formData.tieredBonusRates.tier2.min}
                      onChange={(e) => handleTierChange('tier2', 'min', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tier2Max">Max Sales</Label>
                    <Input
                      id="tier2Max"
                      type="number"
                      value={formData.tieredBonusRates.tier2.max}
                      onChange={(e) => handleTierChange('tier2', 'max', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tier2Amount">Bonus (PKR)</Label>
                    <Input
                      id="tier2Amount"
                      type="number"
                      value={formData.tieredBonusRates.tier2.amount}
                      onChange={(e) => handleTierChange('tier2', 'amount', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Tier 3 */}
              <div className="space-y-4">
                <h4 className="font-semibold font-poppins">Tier 3 (Sales 21-25)</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="tier3Min">Min Sales</Label>
                    <Input
                      id="tier3Min"
                      type="number"
                      value={formData.tieredBonusRates.tier3.min}
                      onChange={(e) => handleTierChange('tier3', 'min', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tier3Max">Max Sales</Label>
                    <Input
                      id="tier3Max"
                      type="number"
                      value={formData.tieredBonusRates.tier3.max}
                      onChange={(e) => handleTierChange('tier3', 'max', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tier3Amount">Bonus (PKR)</Label>
                    <Input
                      id="tier3Amount"
                      type="number"
                      value={formData.tieredBonusRates.tier3.amount}
                      onChange={(e) => handleTierChange('tier3', 'amount', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Tier 4 */}
              <div className="space-y-4">
                <h4 className="font-semibold font-poppins">Tier 4 (Sales 26+)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="tier4Min">Min Sales</Label>
                    <Input
                      id="tier4Min"
                      type="number"
                      value={formData.tieredBonusRates.tier4.min}
                      onChange={(e) => handleTierChange('tier4', 'min', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tier4Amount">Bonus (PKR)</Label>
                    <Input
                      id="tier4Amount"
                      type="number"
                      value={formData.tieredBonusRates.tier4.amount}
                      onChange={(e) => handleTierChange('tier4', 'amount', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};