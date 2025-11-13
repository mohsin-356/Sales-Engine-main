import * as React from 'react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Calendar, User, DollarSign } from 'lucide-react';

type FollowUpCardProps = {
  clientName: string;
  projectName: string;
  followUpDate: Date;
  estimatedValue: number;
  status: string;
};

export const FollowUpCard = ({
  clientName,
  projectName,
  followUpDate,
  estimatedValue,
  status,
}: FollowUpCardProps) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{clientName}</h3>
          <p className="text-sm text-muted-foreground">{projectName}</p>
        </div>
        <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
          {status}
        </span>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{format(followUpDate, 'MMM d')}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="text-sm">{estimatedValue.toLocaleString()}</span>
        </div>
      </div>
    </Card>
  );
};
