import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { Lead } from '@/types';

export const useLeads = () => {
  const { leads } = useContext(AuthContext);
  
  return {
    leads: leads || [],
    isLoading: false
  };
};
