import React, { useState } from 'react';
import { CheckSquare, Square, ClipboardCheck, Info } from 'lucide-react';

const DEFAULT_ITEMS = [
  { id: 'item_1', label: 'Borrower Consent & Scope Verified (90-day window)', checked: true, req: 'Mandatory' },
  { id: 'item_2', label: 'Evidence Completeness Ratio (>= 80% cycles observed)', checked: true, req: 'Mandatory' },
  { id: 'item_3', label: 'Behavioral Anomaly & Inflow Spike Cross-Checked', checked: false, req: 'Review' },
  { id: 'item_4', label: 'Utility Payment Discipline (TNEB / Broadband records)', checked: true, req: 'Mandatory' },
  { id: 'item_5', label: 'FOIR & Affordability Sizing against Net Inflow', checked: false, req: 'Underwriter' },
  { id: 'item_6', label: 'KYC & Physical Residence / Shop Check', checked: false, req: 'Field' }
];

export const UnderwritingChecklist = ({ onChecklistChange }) => {
  const [items, setItems] = useState(DEFAULT_ITEMS);

  const toggleItem = (id) => {
    const updated = items.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
    setItems(updated);
    if (onChecklistChange) {
      onChecklistChange(updated);
    }
  };

  const completedCount = items.filter(i => i.checked).length;

  return (
    <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Underwriter Verification Checklist
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          {completedCount} / {items.length} Checked
        </span>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition ${
              item.checked
                ? 'bg-blue-950/20 border-blue-600/40 text-slate-200'
                : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {item.checked ? (
                <CheckSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
              <span className={`text-xs ${item.checked ? 'text-white font-medium' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
              {item.req}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
