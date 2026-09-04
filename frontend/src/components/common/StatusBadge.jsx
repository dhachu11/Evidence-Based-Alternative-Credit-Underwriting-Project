import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, XCircle } from 'lucide-react';

export const StatusBadge = ({ status, size = "md" }) => {
  const s = (status || "").toUpperCase();

  const configs = {
    "SUFFICIENT": {
      bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
      label: "SUFFICIENT EVIDENCE",
      dot: "bg-emerald-400"
    },
    "SUFFICIENT_WITH_WARNING": {
      bg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      icon: AlertTriangle,
      label: "SUFFICIENT WITH WARNING",
      dot: "bg-amber-400"
    },
    "LIMITED": {
      bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: AlertTriangle,
      label: "LIMITED EVIDENCE",
      dot: "bg-amber-400"
    },
    "LIMITED EVIDENCE": {
      bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: AlertTriangle,
      label: "LIMITED EVIDENCE",
      dot: "bg-amber-400"
    },
    "INCONSISTENT": {
      bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      icon: AlertOctagon,
      label: "INCONSISTENT EVIDENCE",
      dot: "bg-rose-400"
    },
    "INCONSISTENT EVIDENCE": {
      bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      icon: AlertOctagon,
      label: "INCONSISTENT EVIDENCE",
      dot: "bg-rose-400"
    },
    "INSUFFICIENT": {
      bg: "bg-slate-500/10 text-slate-300 border-slate-500/30",
      icon: HelpCircle,
      label: "INSUFFICIENT EVIDENCE",
      dot: "bg-slate-400"
    },
    "INSUFFICIENT EVIDENCE": {
      bg: "bg-slate-500/10 text-slate-300 border-slate-500/30",
      icon: HelpCircle,
      label: "INSUFFICIENT EVIDENCE",
      dot: "bg-slate-400"
    },
    "LOW": {
      bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
      label: "LOW RISK",
      dot: "bg-emerald-400"
    },
    "LOW–MEDIUM": {
      bg: "bg-teal-500/10 text-teal-300 border-teal-500/30",
      icon: CheckCircle2,
      label: "LOW–MEDIUM RISK",
      dot: "bg-teal-400"
    },
    "MEDIUM–HIGH": {
      bg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      icon: AlertTriangle,
      label: "MEDIUM–HIGH RISK",
      dot: "bg-amber-400"
    },
    "HIGH": {
      bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      icon: XCircle,
      label: "HIGH RISK",
      dot: "bg-rose-400"
    }
  };

  const current = configs[s] || {
    bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    icon: HelpCircle,
    label: s || "UNASSESSED",
    dot: "bg-blue-400"
  };

  const IconComponent = current.icon;
  const isSm = size === "sm";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${current.bg} ${isSm ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs sm:text-sm"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} animate-pulse`} />
      <IconComponent className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span className="tracking-wide">{current.label}</span>
    </span>
  );
};
