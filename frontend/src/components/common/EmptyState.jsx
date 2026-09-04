import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'No matching information is available in the selected view.',
  actionLabel = null,
  onAction = null
}) => {
  return (
    <div className="glass-panel p-8 sm:p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-1">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-white">{title}</h4>
      <p className="text-xs text-slate-400 max-w-md leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
