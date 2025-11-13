import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar } from './calendar';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { format, parse, parseISO } from 'date-fns';
import { Input } from './input';
import { useEffect, useState } from 'react';
import { CalendarIcon, Clock, CheckCircle } from 'lucide-react';

type EnhancedDatePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  className?: string;
  showTime?: boolean;
  calendarClassName?: string;
  calendarStyle?: React.CSSProperties;
};

export const EnhancedDatePicker = ({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select date and time',
  className,
  showTime = true,
  calendarClassName,
  calendarStyle
}: EnhancedDatePickerProps) => {
  const [time, setTime] = useState(value ? format(value, 'HH:mm') : '');
  const [manualDate, setManualDate] = useState(value ? format(value, 'MM/dd/yyyy') : '');

  useEffect(() => {
    if (value) {
      setTime(format(value, 'HH:mm'));
      setManualDate(format(value, 'MM/dd/yyyy'));
    }
  }, [value]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    
    if (newTime.match(/^\d{2}:\d{2}$/)) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = value ? new Date(value) : new Date();
      newDate.setHours(hours, minutes);
      onChange(newDate);
    }
  };

  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setManualDate(input);
    
    // Try multiple date formats for parsing
    const parseDate = (format: string) => {
      try {
        return parse(input, format, new Date());
      } catch {
        return null;
      }
    };
    
    const date = parseDate('MM/dd/yyyy') || parseDate('MM-dd-yyyy') || parseDate('MM.dd.yyyy');
    
    if (date && !isNaN(date.getTime())) {
      if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        date.setHours(hours, minutes);
      }
      onChange(date);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!date) {
      onChange(null);
      return;
    }

    // Always combine with current time if available
    const newDate = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      newDate.setHours(hours, minutes);
    }
    onChange(newDate);
  };

  const validateDate = (date: Date) => {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2">
        <Input
          type="text"
          value={manualDate}
          onChange={handleManualDateChange}
          placeholder="MM/DD/YYYY"
          className="w-32"
        />
        {showTime && (
          <Input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="w-24"
          />
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="px-3">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-lg shadow-lg" align="start">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              onSelect={handleDateChange}
              disabled={(date) => !validateDate(date)}
              initialFocus
              className={cn('border-0', calendarClassName)}
              style={calendarStyle}
            />
          </PopoverContent>
        </Popover>
      </div>
      {value && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Selected: {format(value, 'MMM d, yyyy h:mm aa')}</span>
        </div>
      )}
    </div>
  );
};
