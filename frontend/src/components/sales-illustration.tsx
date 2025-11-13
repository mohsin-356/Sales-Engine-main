import React from 'react';

export const SalesIllustration = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 500 300" className={`w-full h-full ${className}`}>
    <defs>
      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>

    {/* Bar Chart */}
    <rect x="50" y="100" width="60" height="120" fill="url(#chartGradient)" rx="3" />
    <rect x="130" y="60" width="60" height="160" fill="url(#chartGradient)" rx="3" />
    <rect x="210" y="30" width="60" height="190" fill="url(#chartGradient)" rx="3" />
    <rect x="290" y="80" width="60" height="140" fill="url(#chartGradient)" rx="3" />
    <rect x="370" y="110" width="60" height="110" fill="url(#chartGradient)" rx="3" />

    {/* Trend Line */}
    <path 
      d="M40,220 Q150,100 460,160" 
      stroke="#ffffff" 
      strokeWidth="3" 
      fill="none"
      strokeDasharray="8 4"
    />
    
    {/* Data Points */}
    <circle cx="150" cy="100" r="5" fill="#ffffff" />
    <circle cx="230" cy="70" r="5" fill="#ffffff" />
    <circle cx="320" cy="130" r="5" fill="#ffffff" />
  </svg>
);
