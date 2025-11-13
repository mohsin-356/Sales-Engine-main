interface CommissionParams {
  projectAmount: number;
  advanceAmount: number;
}

export function calculateCommission({ projectAmount, advanceAmount }: CommissionParams) {
  const MIN_PROJECT_AMOUNT = 50000;
  const MIN_ADVANCE_PERCENTAGE = 0.2;
  
  if (projectAmount < MIN_PROJECT_AMOUNT) {
    return { 
      commission: 0,
      isValid: false,
      message: 'No commission for projects under 50K PKR'
    };
  }
  
  if (advanceAmount < projectAmount * MIN_ADVANCE_PERCENTAGE) {
    return {
      commission: 0,
      isValid: false,
      message: 'Advance must be at least 20% of project cost'
    };
  }
  
  // Commission is 10% of project amount for verified sales
  return {
    commission: projectAmount * 0.1,
    isValid: true,
    message: ''
  };
}
