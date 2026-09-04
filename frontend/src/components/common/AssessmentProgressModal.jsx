import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Sparkles, Database, FileCheck, Cpu, Scale, BrainCircuit } from 'lucide-react';

const STEPS = [
  { id: 1, label: "Verifying Borrower Consent & Scope", icon: FileCheck, duration: 400 },
  { id: 2, label: "Extracting Multi-Source Alternative Data", icon: Database, duration: 450 },
  { id: 3, label: "Executing Evidence Validation Layer (History, Stability)", icon: Scale, duration: 550 },
  { id: 4, label: "Engineering Domain Features & Cross-Consistency", icon: Cpu, duration: 400 },
  { id: 5, label: "Running Calibrated XGBoost Risk Estimator", icon: BrainCircuit, duration: 500 },
  { id: 6, label: "Computing SHAP Feature Attributions & Impact Factors", icon: Sparkles, duration: 450 },
  { id: 7, label: "Synthesizing Decision Support Recommendation", icon: CheckCircle2, duration: 350 }
];

export const AssessmentProgressModal = ({ isOpen, onComplete, customerName }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    let current = 0;
    const executeStep = () => {
      if (current < STEPS.length - 1) {
        current++;
        setCurrentStepIndex(current);
        timeout = setTimeout(executeStep, STEPS[current].duration);
      } else {
        timeout = setTimeout(() => {
          onComplete();
        }, 500);
      }
    };

    let timeout = setTimeout(executeStep, STEPS[0].duration);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-[#0B1E36] border border-blue-800/60 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-3 animate-pulse">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Running Evidence-Based Assessment</h3>
          <p className="text-xs text-slate-400 mt-1">Evaluating alternative financial profile for <span className="text-blue-300 font-medium">{customerName}</span></p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-6 overflow-hidden border border-slate-700/50">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 transition-all duration-300 rounded-full"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step Sequence List */}
        <div className="space-y-3">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <div 
                key={step.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 ${
                  isCurrent 
                    ? "bg-blue-600/15 border-blue-500/50 text-white" 
                    : isDone 
                      ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-300"
                      : "bg-slate-900/40 border-slate-800/40 text-slate-500"
                }`}
              >
                <div className="flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <span className="text-xs font-medium truncate">{step.label}</span>
                {isCurrent && (
                  <span className="ml-auto text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-400 italic">
            Validating cross-source integrity prior to statistical risk inference...
          </p>
        </div>
      </div>
    </div>
  );
};
