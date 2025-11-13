export function useRepSettings(employeeId: string): {
  settings: {
    salesTarget: number;
    baseSalary: number;
    commissionRate: number;
  };
  isLoading: boolean;
  isError: boolean;
};
