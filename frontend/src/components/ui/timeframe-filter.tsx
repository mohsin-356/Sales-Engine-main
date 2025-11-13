import React, { useState } from 'react';
import { TimeFrame } from '@/utils/date';
import { Button } from './button';
import { DatePicker } from './date-picker';
import { Tabs, TabsList, TabsTrigger } from './tabs';

export interface TimeFrameFilterValue {
  timeframe: TimeFrame;
  customStart?: string; // ISO date string
  customEnd?: string;   // ISO date string
}

interface Props {
  value: TimeFrameFilterValue;
  onChange: (val: TimeFrameFilterValue) => void;
  className?: string;
}

/**
 * Provides a small tabbed control for selecting Daily / Weekly / Monthly or a custom date range.
 */
export const TimeFrameFilter: React.FC<Props> = ({ value, onChange, className }) => {
  const [internal, setInternal] = useState<TimeFrameFilterValue>(value);

  const handleTab = (tf: TimeFrame) => {
    const updated = { timeframe: tf } as TimeFrameFilterValue;
    setInternal(updated);
    onChange(updated);
  };

  const handleCustomDate = (field: 'customStart' | 'customEnd', dateStr: string) => {
    const updated = { ...internal, timeframe: 'custom', [field]: dateStr } as TimeFrameFilterValue;
    setInternal(updated);
    onChange(updated);
  };

  return (
    <div className={className}>
      <Tabs value={internal.timeframe} onValueChange={(v) => handleTab(v as TimeFrame)}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
      </Tabs>
      {internal.timeframe === 'custom' && (
        <div className="flex items-center space-x-2 mt-2">
          <DatePicker
            date={internal.customStart ? new Date(internal.customStart) : null}
            onChange={(d) => handleCustomDate('customStart', d ? d.toISOString().slice(0,10) : '')}
          />
          <span className="text-sm">to</span>
          <DatePicker
            date={internal.customEnd ? new Date(internal.customEnd) : null}
            onChange={(d) => handleCustomDate('customEnd', d ? d.toISOString().slice(0,10) : '')}
          />
          {/* Apply button for explicitness on small screens */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(internal)}
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
};

export default TimeFrameFilter;
