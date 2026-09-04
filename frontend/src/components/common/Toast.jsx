import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ type = 'success', message, onClose }) => {
  if (!message) return null;

  const configs = {
    success: { bg: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200', icon: CheckCircle2, iconColor: 'text-emerald-400' },
    error: { bg: 'bg-rose-950/90 border-rose-500/40 text-rose-200', icon: XCircle, iconColor: 'text-rose-400' },
    warning: { bg: 'bg-amber-950/90 border-amber-500/40 text-amber-200', icon: AlertTriangle, iconColor: 'text-amber-400' },
    info: { bg: 'bg-blue-950/90 border-blue-500/40 text-blue-200', icon: Info, iconColor: 'text-blue-400' }
  };

  const current = configs[type] || configs.info;
  const Icon = current.icon;

  return (
    <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border shadow-2xl flex items-center gap-3 max-w-md ${current.bg} backdrop-blur-md animate-slide-up`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${current.iconColor}`} />
      <span className="text-xs font-medium flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
