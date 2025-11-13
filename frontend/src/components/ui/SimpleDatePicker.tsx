import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Input } from './input';
import { CalendarIcon, Clock } from 'lucide-react';

type SimpleDatePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  showTime?: boolean;
  placeholder?: string;
};

export const SimpleDatePicker = ({
  value,
  onChange,
  showTime = true,
  placeholder = 'Select date and time'
}: SimpleDatePickerProps) => {
  const [time, setTime] = useState(value ? format(value, 'HH:mm') : '');

  const handleDateChange = (date: Date | undefined) => {
    if (!date) {
      onChange(null);
      return;
    }
    
    const newDate = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      newDate.setHours(hours, minutes);
    }
    onChange(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    
    if (value && newTime.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes);
      onChange(newDate);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'MMM d, yyyy') : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {showTime && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="w-24"
          />
        </div>
      )}
    </div>
  );
};
