import React from 'react';

export const ThreeDIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    
    <circle cx="100" cy="100" r="80" fill="url(#gradient)" />
    <path 
      d="M30,100 Q100,30 170,100 T30,100" 
      fill="none" 
      stroke="white" 
      strokeWidth="2"
    />
  </svg>
);

export const ThreeDIllustrationFallback = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    
    <circle cx="100" cy="100" r="80" fill="url(#gradient)" />
    <path 
      d="M30,100 Q100,30 170,100 T30,100" 
      fill="none" 
      stroke="white" 
      strokeWidth="2"
    />
  </svg>
);
