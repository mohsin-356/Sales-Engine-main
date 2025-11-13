import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { Sale } from '@/types';

export const useSales = () => {
  const { sales } = useContext(AuthContext);
  
  return {
    sales: sales || [],
    isLoading: false
  };
};
