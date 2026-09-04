import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export const ErrorMessage = ({
  title = 'Unable to complete operation',
  message = 'Please retry or proceed with manual underwriting verification.',
  onRetry = null
}) => {
  return (
    <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-rose-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-white text-sm">{title}</h4>
          <p className="text-slate-300 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} icon={RotateCcw}>
          Retry Action
        </Button>
      )}
    </div>
  );
};
