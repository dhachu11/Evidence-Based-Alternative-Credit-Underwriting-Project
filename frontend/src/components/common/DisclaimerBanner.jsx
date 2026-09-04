import React, { useState } from 'react';
import { ShieldAlert, Info, X } from 'lucide-react';

export const DisclaimerBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-blue-950/80 border-b border-blue-900/40 text-xs px-4 py-2 text-slate-300 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 max-w-6xl mx-auto">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold uppercase tracking-wider text-[10px] border border-blue-400/30">
          Prototype Mode
        </span>
        <span className="text-slate-300">
          <strong className="text-white font-medium">Core Principle:</strong> New-to-credit does not mean high-risk. This evidence-aware decision support engine validates data before ML. Prototype uses synthetic data.
        </span>
      </div>
      <button 
        onClick={() => setDismissed(true)} 
        className="text-slate-400 hover:text-white p-0.5 rounded transition"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
