import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Processing alternative data...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-blue-400 animate-spin`} />
      {label && <p className="text-xs text-slate-400 font-medium">{label}</p>}
    </div>
  );
};
