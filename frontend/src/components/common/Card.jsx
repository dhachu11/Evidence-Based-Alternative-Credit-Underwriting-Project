import React from 'react';

export const Card = ({ children, className = '', hover = false, borderGlow = false }) => {
  return (
    <div className={`glass-panel rounded-2xl p-6 ${hover ? 'glass-card-hover' : ''} ${borderGlow ? 'border-blue-500/50 shadow-lg shadow-blue-950/40' : ''} ${className}`}>
      {children}
    </div>
  );
};
