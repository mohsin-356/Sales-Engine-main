import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { Input } from './input';
import { Label } from './label';

type ManualDateTimeInputProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

export const ManualDateTimeInput = ({ value, onChange }: ManualDateTimeInputProps) => {
  const [dateInput, setDateInput] = useState(value ? format(value, 'yyyy-MM-dd') : '');
  const [timeInput, setTimeInput] = useState(value ? format(value, 'HH:mm') : '');

  useEffect(() => {
    // Try to parse when both fields have values
    if (dateInput && timeInput) {
      try {
        const dateStr = `${dateInput}T${timeInput}`;
        const newDate = new Date(dateStr);
        if (!isNaN(newDate.getTime())) {
          onChange(newDate);
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }
  }, [dateInput, timeInput, onChange]);

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="mb-1 text-sm font-medium text-gray-700">Date</div>
          <Input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex-1">
          <div className="mb-1 text-sm font-medium text-gray-700">Time</div>
          <Input
            type="time"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
      {value && (
        <div className="text-xs text-gray-500">
          Selected: {format(value, 'MMM d, yyyy h:mm a')}
        </div>
      )}
    </div>
  );
};
