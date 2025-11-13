import * as React from 'react';
import { format } from 'date-fns';
import { Calendar } from './calendar';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';

interface Props {
  date: Date | null;
  onChange: (d: Date | null) => void;
  placeholder?: string;
  className?: string;
}

// A reusable stylish date picker input using popover + calendar
export const DatePicker: React.FC<Props> = ({ date, onChange, placeholder = 'Pick a date', className }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-[140px] justify-start text-left font-normal', !date && 'text-muted-foreground', className)}
        >
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-white shadow-xl rounded-xl border border-slate-200" align="start">
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={(d) => {
            onChange(d ?? null);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
