import { useEffect, useState } from 'react';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

export function useRepSettings(employeeId: string) {
  const { data, error } = useSWR(`/api/users/${employeeId}`, fetcher);
  const [settings, setSettings] = useState({
    salesTarget: 500000,
    baseSalary: 0,
    commissionRate: 0.1
  });

  useEffect(() => {
    if (data) {
      setSettings({
        salesTarget: data.settings?.salesTarget || 500000,
        baseSalary: data.settings?.baseSalary || 0,
        commissionRate: data.settings?.commissionRate || 0.1
      });
    }
  }, [data]);

  return {
    settings,
    isLoading: !error && !data,
    isError: error
  };
}
