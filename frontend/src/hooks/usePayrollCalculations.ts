import { useMemo } from 'react';
import { Sale, AttendanceRecord, CompanySettings } from '@/types';

const defaultSettings: CompanySettings = {
  baseSalary: 30000,
  salesTarget: 12,
  revenueTarget: 400000,
  projectBonusThreshold: 50000,
  projectBonusRate: 0.05,
  deductionPerMissedSale: 4000,
  tieredBonusRates: {
    tier1: { min: 13, max: 15, amount: 2000 },
    tier2: { min: 16, max: 20, amount: 3000 },
    tier3: { min: 21, max: 25, amount: 4000 },
    tier4: { min: 26, amount: 6000 }
  }
};

export const usePayrollCalculations = (
  employeeId: string,
  sales: Sale[],
  attendance: AttendanceRecord[],
  month: number,
  year: number,
  settings: CompanySettings = defaultSettings
) => {
  return useMemo(() => {
    // Filter sales for the employee and month
    const employeeSales = sales.filter(sale => 
      sale.employeeId === employeeId &&
      new Date(sale.date).getMonth() === month &&
      new Date(sale.date).getFullYear() === year
    );

    // Filter attendance for the month
    const employeeAttendance = attendance.filter(record => 
      record.employeeId === employeeId &&
      new Date(record.date).getMonth() === month &&
      new Date(record.date).getFullYear() === year
    );

    // Calculate confirmed sales
    const confirmedSales = employeeSales.filter(sale => sale.isConfirmed);
    const confirmedSalesCount = confirmedSales.length;
    const totalRevenue = confirmedSales.reduce((sum, sale) => sum + sale.invoiceAmount, 0);

    // Calculate project bonuses (5% for projects > 50k)
    const projectBonuses = confirmedSales
      .filter(sale => sale.invoiceAmount > settings.projectBonusThreshold)
      .reduce((sum, sale) => sum + (sale.invoiceAmount * settings.projectBonusRate), 0);

    // Calculate tiered bonuses (only if confirmed sales >= 12)
    let tieredBonuses = 0;
    if (confirmedSalesCount >= settings.salesTarget) {
      // Count sales beyond the target for tiered bonuses
      const bonusSales = confirmedSalesCount;
      
      // Tier 1: Sales 13-15
      if (bonusSales >= 13) {
        const tier1Sales = Math.min(bonusSales, 15) - 12;
        tieredBonuses += tier1Sales * settings.tieredBonusRates.tier1.amount;
      }
      
      // Tier 2: Sales 16-20
      if (bonusSales >= 16) {
        const tier2Sales = Math.min(bonusSales, 20) - 15;
        tieredBonuses += tier2Sales * settings.tieredBonusRates.tier2.amount;
      }
      
      // Tier 3: Sales 21-25
      if (bonusSales >= 21) {
        const tier3Sales = Math.min(bonusSales, 25) - 20;
        tieredBonuses += tier3Sales * settings.tieredBonusRates.tier3.amount;
      }
      
      // Tier 4: Sales 26+
      if (bonusSales >= 26) {
        const tier4Sales = bonusSales - 25;
        tieredBonuses += tier4Sales * settings.tieredBonusRates.tier4.amount;
      }
    }

    // Calculate attendance
    const daysWorked = employeeAttendance.filter(record => 
      record.status === 'present' || record.status === 'late'
    ).length;
    
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const fridaysInMonth = Math.floor(totalDaysInMonth / 7) * 1; // Approximate
    const workingDays = totalDaysInMonth - fridaysInMonth;

    // Calculate pro-rated base salary
    const proRatedBase = settings.baseSalary * (daysWorked / workingDays);

    // Calculate deductions (shortage from target)
    const missedSales = Math.max(0, settings.salesTarget - confirmedSalesCount);
    const deductions = missedSales * settings.deductionPerMissedSale * (daysWorked / workingDays);

    // Calculate net pay
    const netPay = proRatedBase + projectBonuses + tieredBonuses - deductions;

    return {
      baseSalary: proRatedBase,
      daysWorked,
      totalDays: workingDays,
      confirmedSalesCount,
      totalRevenue,
      projectBonuses,
      tieredBonuses,
      deductions,
      netPay,
      targetProgress: {
        salesProgress: (confirmedSalesCount / settings.salesTarget) * 100,
        revenueProgress: (totalRevenue / settings.revenueTarget) * 100,
        isTargetMet: confirmedSalesCount >= settings.salesTarget
      }
    };
  }, [employeeId, sales, attendance, month, year, settings]);
};