import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  UserCheck, 
  Settings, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Scale, 
  Cpu, 
  CheckCircle2, 
  BrainCircuit,
  Lock,
  Layers
} from 'lucide-react';

export const LandingPage = ({ onSelectPortal, onSelectCustomer }) => {
  const { quickSwitchRole } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>TVS Credit Decision Engine • Hackathon Prototype</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          "New-to-credit does not mean high-risk. It means traditional evidence is insufficient."
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          An evidence-aware decision-support platform that validates consented alternative financial data before statistical risk inference, explains predictions with SHAP, and empowers human underwriters.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              quickSwitchRole('loan_officer');
              onSelectPortal('officer');
            }}
            className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-900/40 transition flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>ENTER LOAN OFFICER PORTAL (MAIN)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              quickSwitchRole('customer', 'CUST-101');
              onSelectCustomer('CUST-101');
              onSelectPortal('customer');
            }}
            className="px-5 py-3 rounded-xl text-sm font-semibold bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Borrower Consent Center</span>
          </button>
        </div>
      </div>

      {/* 3 Role Portals Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Portal 1: Customer */}
        <div 
          onClick={() => {
            quickSwitchRole('customer', 'CUST-101');
            onSelectCustomer('CUST-101');
            onSelectPortal('customer');
          }}
          className="glass-panel p-6 rounded-2xl glass-card-hover cursor-pointer border-slate-800 hover:border-blue-500/50 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">PORTAL 1</span>
            <h3 className="text-lg font-bold text-white mb-2">Customer & Borrower Portal</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Simple, transparent consent manager. Review UPI, Utility, and GST permissions, toggle data streams, and inspect underwriting progress.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">✓ Consent management</li>
              <li className="flex items-center gap-2">✓ Granular data stream toggles</li>
              <li className="flex items-center gap-2">✓ Revoke access anytime</li>
            </ul>
          </div>
          <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400">
            <span>Launch Borrower Portal</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Portal 2: Loan Officer ⭐ MAIN */}
        <div 
          onClick={() => {
            quickSwitchRole('loan_officer');
            onSelectPortal('officer');
          }}
          className="glass-panel p-6 rounded-2xl glass-card-hover cursor-pointer border-blue-600/50 bg-gradient-to-b from-blue-950/40 to-slate-900/90 shadow-xl shadow-blue-950/50 flex flex-col justify-between relative"
        >
          <div className="absolute top-4 right-4">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40">
              ⭐ MAIN HUB
            </span>
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">PORTAL 2</span>
            <h3 className="text-lg font-bold text-white mb-2">Loan Officer Workbench</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Core underwriter cockpit. Validates evidence quality, runs calibrated XGBoost risk estimator, reviews SHAP explanations, and records underwriting decisions.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">✓ Evidence Validation Layer</li>
              <li className="flex items-center gap-2">✓ Calibrated Repayment Probability</li>
              <li className="flex items-center gap-2">✓ Plain-English SHAP factors</li>
              <li className="flex items-center gap-2">✓ Refuses score when insufficient</li>
            </ul>
          </div>
          <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-white">
            <span>Launch Officer Workbench</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
          </div>
        </div>

        {/* Portal 3: Admin */}
        <div 
          onClick={() => {
            quickSwitchRole('admin');
            onSelectPortal('admin');
          }}
          className="glass-panel p-6 rounded-2xl glass-card-hover cursor-pointer border-slate-800 hover:border-purple-500/50 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-4">
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">PORTAL 3</span>
            <h3 className="text-lg font-bold text-white mb-2">Admin & Model Monitoring</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Model performance monitoring (Logistic vs XGBoost), calibration curves, configurable prototype thresholds, system audit logs, and retailer workflow insights.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">✓ Model telemetry & comparison</li>
              <li className="flex items-center gap-2">✓ Live threshold tuning</li>
              <li className="flex items-center gap-2">✓ Full audit trail & roadmap</li>
            </ul>
          </div>
          <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-400">
            <span>Launch Admin Portal</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Core Architectural Flow & Principles */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800 bg-slate-900/60">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl font-bold text-white">Underwriting Flow & Product Principles</h2>
          <p className="text-xs text-slate-400 mt-1">
            How evidence-awareness prevents manufactured confidence in alternative credit scoring
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-blue-400 font-bold flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px]">1</span>
              <span>Evidence Before ML</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Validates history length, completeness, stability, and anomalies. Never scores thin data blindly.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
              <span>Saying "I Don't Know"</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              If data &lt;30 days or inconsistent, the system halts ML and requests additional documents.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
              <span>Calibrated Probability</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Predicts loan repayment probability, not an arbitrary proprietary score.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-indigo-400 font-bold flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px]">4</span>
              <span>Human in the Loop</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Separates risk from affordability; final lending authority remains strictly with human underwriters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
