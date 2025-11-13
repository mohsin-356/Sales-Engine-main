import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Lead } from '@/types';

export const showReminderNotification = (lead: Lead) => {
  toast.success(
    `Follow-up with ${lead.clientName} for ${lead.projectName} at ${format(new Date(lead.followUpDate), 'h:mm a')}`,
    {
      duration: 6000,
      position: 'top-right',
    }
  );
};

export const checkFollowUpReminders = (leads: Lead[]) => {
  const now = new Date();
  const in30Minutes = new Date(now.getTime() + 30 * 60000);
  
  leads.forEach(lead => {
    if (lead.followUpDate) {
      const followUpDate = new Date(lead.followUpDate);
      if (followUpDate > now && followUpDate <= in30Minutes) {
        showReminderNotification(lead);
      }
    }
  });
};
