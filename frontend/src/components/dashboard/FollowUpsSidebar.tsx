import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { CalendarIcon, Filter, ArrowUpDown, Phone, Mail } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type FollowUpsSidebarProps = {
  leads: Lead[];
};

export const FollowUpsSidebar = ({ leads }: FollowUpsSidebarProps) => {
  console.log('Received leads:', leads);
  
  const [sortBy, setSortBy] = useState<'date' | 'client'>('date');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const upcomingFollowups = leads
    .filter(lead => {
      if (!lead.followUpDate) return false;
      if (filterStatus !== 'all' && lead.status !== filterStatus) return false;
      return new Date(lead.followUpDate) > new Date();
    })
    .sort((a, b) => {
      if (sortBy === 'client') {
        return a.clientName.localeCompare(b.clientName);
      }
      return new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime();
    });
    
  console.log('Filtered follow-ups:', upcomingFollowups);

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`);
  };

  return (
    <Card className="p-4 h-full min-w-[280px] bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-200 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-indigo-700">Upcoming Follow-ups</h3>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value: 'date' | 'client') => setSortBy(value)}>
            <SelectTrigger className="h-8 w-8 p-0 bg-white border-gray-300 hover:bg-gray-50">
              <ArrowUpDown className="h-4 w-4 text-indigo-600" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="client">Sort by Client</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(value: string) => setFilterStatus(value)}>
            <SelectTrigger className="h-8 w-8 p-0">
              <Filter className="h-4 w-4" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {upcomingFollowups.length > 0 ? (
        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {upcomingFollowups.map(lead => (
            <motion.div 
              key={lead.id}
              className="p-3 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{lead.clientName}</h4>
                  <p className="text-sm text-gray-600">{lead.projectName}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {lead.status}
                </span>
              </div>
              
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {format(new Date(lead.followUpDate), 'MMM d, h:mm a')}
              </div>

              <div className="mt-3 flex space-x-2">
                {lead.phone && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 px-2 text-xs bg-green-50 hover:bg-green-100 text-green-700"
                    onClick={() => handleCall(lead.phone)}
                    disabled={!lead.phone}
                  >
                    <Phone className="h-3 w-3 mr-1" /> Call
                  </Button>
                )}
                {lead.clientEmail && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 px-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700"
                    onClick={() => handleEmail(lead.clientEmail)}
                  >
                    <Mail className="h-3 w-3 mr-1" /> Email
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          No upcoming follow-ups found
        </div>
      )}
    </Card>
  );
};
