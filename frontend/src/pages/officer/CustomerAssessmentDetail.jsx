import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AssessmentProgressModal } from '../../components/common/AssessmentProgressModal';
import { UnderwritingChecklist } from '../../components/officer/UnderwritingChecklist';
import { 
  ArrowLeft, 
  Play, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  Cpu, 
  FileText, 
  CheckCircle2, 
  AlertOctagon, 
  XCircle, 
  HelpCircle,
  Clock, 
  Layers, 
  UserCheck, 
  ChevronRight,
  Sparkles,
  Info,
  Building,
  Smartphone,
  Zap,
  Receipt,
  FileCheck,
  Send,
  Lock,
  ThumbsUp,
  ThumbsDown,
  RotateCcw
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const CustomerAssessmentDetail = ({ customerId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningModal, setRunningModal] = useState(false);
  const [preferredModel, setPreferredModel] = useState('xgboost');
  const [activeAssessment, setActiveAssessment] = useState(null);

  // Underwriter decision state
  const [decisionType, setDecisionType] = useState('PROCEED_STAGE_2');
  const [officerNotes, setOfficerNotes] = useState('');
  const [savingDecision, setSavingDecision] = useState(false);
  const [decisionSuccessMsg, setDecisionSuccessMsg] = useState(null);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomerDetails(customerId);
      setData(res);
      if (res.latest_assessment) {
        setActiveAssessment(res.latest_assessment);
      }
    } catch (err) {
      console.error('Error loading customer assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const handleStartAssessment = () => {
    setRunningModal(true);
  };

  const handleAssessmentComplete = async () => {
    try {
      const result = await api.runAssessment(customerId, preferredModel);
      setActiveAssessment(result);
      await fetchCustomer();
    } catch (err) {
      alert("Assessment execution failed: " + err.message);
    } finally {
      setRunningModal(false);
    }
  };

  const handleSaveDecision = async () => {
    if (!activeAssessment) {
      alert("Please execute an assessment before logging the underwriting decision.");
      return;
    }
    setSavingDecision(true);
    try {
      await api.recordUnderwritingDecision(activeAssessment.id || 1, {
        decision: decisionType,
        notes: officerNotes || "Standard underwriter review completed in accordance with TVS Credit policy.",
        officer_id: "OFFICER-01"
      });
      setDecisionSuccessMsg("Human underwriting decision successfully logged to audit records.");
      await fetchCustomer();
    } catch (err) {
      alert("Failed to record decision: " + err.message);
    } finally {
      setSavingDecision(false);
      setTimeout(() => setDecisionSuccessMsg(null), 4000);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Cpu className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading Customer Decision Profile...</p>
        </div>
      </div>
    );
  }

  const { customer, consent, upi_transactions, utility_payments, gst_records } = data || {};
  const assessment = activeAssessment || data?.latest_assessment;
  const isSufficientEvidence = assessment?.evidence_status?.includes("SUFFICIENT");
  const isInsufficient = assessment?.evidence_status === "INSUFFICIENT";
  const isLimited = assessment?.evidence_status === "LIMITED";
  const isInconsistent = assessment?.evidence_status === "INCONSISTENT";

  // Parse SHAP contributions if available
  const shapData = assessment?.explanation?.contributions?.map(c => ({
    name: c.label.length > 22 ? c.label.slice(0, 20) + '...' : c.label,
    shap: c.shap_value,
    impact: c.impact
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Assessment Progress Animation Modal */}
      <AssessmentProgressModal
        isOpen={runningModal}
        onComplete={handleAssessmentComplete}
        customerName={customer?.name || "Customer"}
      />

      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Loan Officer Queue</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <span className="text-slate-400 px-2 text-[11px]">Model:</span>
            <button
              onClick={() => setPreferredModel('xgboost')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                preferredModel === 'xgboost' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Calibrated XGBoost (v1.0)
            </button>
            <button
              onClick={() => setPreferredModel('logistic')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                preferredModel === 'logistic' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Logistic Baseline
            </button>
          </div>

          {/* Run Assessment Button */}
          <button
            onClick={handleStartAssessment}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/40 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RUN ASSESSMENT</span>
          </button>
        </div>
      </div>

      {/* Customer Header Summary Card */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {customer?.customer_type}
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {customer?.id}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                📍 {customer?.location}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {customer?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              {customer?.headline}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
              <span>Masked Phone: <strong className="text-slate-200 font-mono">{customer?.phone_masked}</strong></span>
              <span>Bureau Check: <strong className="text-amber-300 font-medium">{customer?.bureau_status}</strong></span>
              <span>Consent: <strong className="text-emerald-400 font-medium">{consent?.consent_status || 'ACTIVE'} (90-Day Scope)</strong></span>
            </div>
          </div>

          {/* Current Decision Engine Recommendation Status */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl min-w-[280px]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Current Evidence & Decision Status
            </span>
            <div className="mb-2">
              <StatusBadge status={assessment?.evidence_status || "UNASSESSED"} />
            </div>
            <div className="text-xs font-bold text-white leading-tight">
              {assessment?.recommendation || "Pending Assessment Run"}
            </div>
            {assessment?.risk_probability && (
              <p className="text-[11px] text-blue-300 font-mono mt-1">
                Repayment Probability: {(assessment.risk_probability * 100).toFixed(0)}% ({assessment.risk_band})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Evidence Validation & ML Risk & SHAP */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: Evidence Validation Layer */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Evidence Validation Layer</h2>
                  <p className="text-xs text-slate-400">Cross-source reliability, history length, and stability verification</p>
                </div>
              </div>

              <StatusBadge status={assessment?.evidence_status || "UNASSESSED"} size="sm" />
            </div>

            {/* Evidence Metrics Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {/* History Days */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">History Span</span>
                <span className="text-lg font-black text-white font-mono">
                  {assessment?.evidence_validation?.metrics?.history_days || (upi_transactions?.length ? 90 : 15)} Days
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Min required: 90d (Suff) / 30d (Lim)
                </span>
              </div>

              {/* Data Completeness */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Completeness</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {((assessment?.evidence_validation?.metrics?.completeness_rate || 0.96) * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Target threshold: 80%
                </span>
              </div>

              {/* Cross-Source Consistency */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Consistency</span>
                <span className={`text-lg font-black font-mono ${
                  (assessment?.evidence_validation?.metrics?.consistency_score || 0.9) < 0.6 ? 'text-rose-400' : 'text-blue-400'
                }`}>
                  {((assessment?.evidence_validation?.metrics?.consistency_score || 0.90) * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  UPI vs Utility vs GST
                </span>
              </div>

              {/* Anomaly Detection Status */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Anomaly Flag</span>
                <span className={`text-sm font-bold block mt-1 ${
                  assessment?.evidence_validation?.metrics?.anomaly_detected ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {assessment?.evidence_validation?.metrics?.anomaly_detected ? '⚠️ Flagged' : '✓ Normal'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Z-score threshold: 2.5σ
                </span>
              </div>
            </div>

            {/* Anomaly / Warning Alert Banner if any */}
            {assessment?.evidence_validation?.metrics?.anomaly_detected && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs mb-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-amber-300">Behavioral Anomaly Detected: </strong>
                  <span>{assessment?.evidence_validation?.metrics?.anomaly_details || "Recent transactional velocity deviates from borrower's historical baseline."}</span>
                  <p className="text-[11px] text-amber-300/80 mt-1 italic">
                    Note: This is a statistical anomaly flag for underwriting review, not a fraud verdict.
                  </p>
                </div>
              </div>
            )}

            {/* Evidence Synthesis Narrative */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Validation Summary: </strong>
                <span>{assessment?.evidence_validation?.reason || "Consented alternative data satisfies prototype history and completeness thresholds."}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: ML Risk Estimation OR "I Don't Know" Gate */}
          {isSufficientEvidence ? (
            /* SUFFICIENT EVIDENCE: DISPLAY CALIBRATED ML RISK ESTIMATE */
            <div className="glass-panel p-6 rounded-2xl border-blue-900/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Calibrated Repayment Risk Estimation</h2>
                    <p className="text-xs text-slate-400">Statistical risk projection based on verified features</p>
                  </div>
                </div>

                <StatusBadge status={assessment?.risk_band || "LOW–MEDIUM"} size="sm" />
              </div>

              {/* Gauge & Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                {/* Repayment Probability Gauge */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Estimated Repayment Probability
                  </span>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-mono my-1">
                    {((assessment?.risk_probability || 0.82) * 100).toFixed(0)}%
                  </div>
                  <span className="text-xs font-semibold text-slate-300">
                    Risk Band: <strong className="text-white">{assessment?.risk_band || "LOW–MEDIUM"}</strong>
                  </span>
                  <p className="text-[9px] text-slate-500 mt-1 italic">
                    Calibrated via Platt scaling on synthetic benchmark
                  </p>
                </div>

                {/* Model Info */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Active ML Model
                  </span>
                  <div className="text-xs font-bold text-white">
                    {assessment?.model_used || "Calibrated XGBoost Classifier v1.0"}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Evaluates non-linear cross-source interactions between cash flow stability and utility discipline.
                  </p>
                </div>

                {/* Target Variable Definition */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Target Variable
                  </span>
                  <div className="text-xs font-bold text-white">
                    Binary Repayment Outcome (1=Current / 0=Delinquent)
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The model does NOT predict an arbitrary credit score. It projects loan repayment probability.
                  </p>
                </div>
              </div>

              {/* SECTION 3: SHAP Feature Impact Breakdown */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Human-Readable Explainability (SHAP Value Breakdown)
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 italic">Plain-English driver analysis</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Positive Factors */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30 space-y-2">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Why Customer Is Considered Lower Risk</span>
                    </div>
                    {assessment?.explanation?.positive_narratives?.map((item, idx) => (
                      <div key={idx} className="text-xs space-y-0.5">
                        <strong className="text-slate-200 block">✓ {item.title}</strong>
                        <span className="text-slate-400 text-[11px]">{item.detail}</span>
                      </div>
                    )) || (
                      <div className="text-xs text-slate-400">
                        ✓ Consistent 90-day daily inflow regularity from verified delivery platform settlements.<br/>
                        ✓ 100% on-time electricity bill clearance across past 3 billing cycles.
                      </div>
                    )}
                  </div>

                  {/* Risk Contributing Factors */}
                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/30 space-y-2">
                    <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-1">
                      <AlertOctagon className="w-4 h-4" />
                      <span>Risk Factors / Mitigants Needed</span>
                    </div>
                    {assessment?.explanation?.risk_narratives?.map((item, idx) => (
                      <div key={idx} className="text-xs space-y-0.5">
                        <strong className="text-slate-200 block">− {item.title}</strong>
                        <span className="text-slate-400 text-[11px]">{item.detail}</span>
                      </div>
                    )) || (
                      <div className="text-xs text-slate-400">
                        − Recent month income spike exceeds historical baseline variance.<br/>
                        − Discretionary buffer is moderate given frequent small-ticket outlays.
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 mt-3 italic">
                  * SHAP explains statistical feature contributions on synthetic training data; it does not establish causal certainty or fairness.
                </p>
              </div>
            </div>
          ) : (
            /* INSUFFICIENT / LIMITED / INCONSISTENT EVIDENCE: "I DON'T KNOW" GATE */
            <div className="glass-panel p-6 rounded-2xl border-amber-900/50 bg-gradient-to-b from-amber-950/20 to-slate-900/60">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex-shrink-0">
                  <HelpCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      System Principle: "I Don't Know"
                    </span>
                    <span className="text-xs font-bold text-white">
                      Automated ML Scoring Refused
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-amber-200">
                    {isInsufficient ? "INSUFFICIENT RELIABLE EVIDENCE" : (isLimited ? "LIMITED EVIDENCE CONFIDENCE" : "INCONSISTENT EVIDENCE FLAGGED")}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {assessment?.action_summary || "We do not have enough reliable alternative history to produce a meaningful statistical risk estimate. The system refuses to manufacture an arbitrary credit score."}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Observed History</span>
                      <strong className="text-white font-mono text-sm">{assessment?.evidence_validation?.metrics?.history_days || 15} Days</strong>
                      <span className="text-[10px] text-amber-400 block mt-0.5">Required minimum: 30 days</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mandatory Underwriting Action</span>
                      <strong className="text-white font-bold">{assessment?.recommendation || "REQUEST ADDITIONAL INFORMATION"}</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Collect passbook stamp or co-applicant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Separate Risk From Affordability Notice */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Underwriting Separation: Alternative Risk vs Affordability</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">1. Alternative Risk</span>
                <strong className="text-blue-300 font-bold mt-1 block">
                  {isSufficientEvidence ? `${assessment?.risk_band} (${((assessment?.risk_probability || 0.82)*100).toFixed(0)}%)` : "UNASSESSED"}
                </strong>
                <span className="text-[9px] text-slate-500 mt-1 block">Consented data pattern</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">2. Affordability & Sizing</span>
                <strong className="text-slate-200 font-bold mt-1 block">Requires TVS Desk</strong>
                <span className="text-[9px] text-slate-500 mt-1 block">FOIR & monthly obligations</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">3. Existing Liabilities</span>
                <strong className="text-slate-200 font-bold mt-1 block">Requires Verification</strong>
                <span className="text-[9px] text-slate-500 mt-1 block">Bank stamp & field check</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">4. Final Sanction</span>
                <strong className="text-emerald-400 font-bold mt-1 block">Human Underwriter</strong>
                <span className="text-[9px] text-slate-500 mt-1 block">Final lending authority</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recommendation & Human Underwriter Workbench */}
        <div className="space-y-6">

          {/* Recommended Action Card */}
          <div className="glass-panel p-6 rounded-2xl border-blue-900/50 bg-gradient-to-b from-blue-950/30 to-slate-900/80">
            <div className="flex items-center gap-2 mb-3">
              <FileCheck className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Recommended Next Action</h3>
            </div>

            <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-700/50 mb-4">
              <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider block mb-1">
                Engine Recommendation
              </span>
              <h4 className="text-base font-black text-white leading-tight">
                {assessment?.recommendation || "PROCEED TO FURTHER UNDERWRITING"}
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {assessment?.action_summary || "Alternative cash flow evidence demonstrates repayment stability. Recommend advancing borrower to formal KYC and income verification."}
              </p>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Decision support output for human underwriter</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Does NOT automatically sanction or reject loan</span>
              </div>
            </div>
          </div>

          {/* Underwriter Verification Checklist */}
          <UnderwritingChecklist />

          {/* Human Underwriter Decision Logger */}
          <div className="glass-panel p-6 rounded-2xl border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Human Underwriter Decision</h3>
            </div>

            {decisionSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-200 text-xs flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{decisionSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select Underwriting Decision:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'PROCEED_STAGE_2', label: '✓ Proceed to Further Underwriting (KYC / Sizing)', color: 'hover:border-emerald-500/50' },
                    { id: 'REQUEST_MORE_DOCS', label: '📄 Request Additional Information / Passbook', color: 'hover:border-amber-500/50' },
                    { id: 'ESCALATE_FIELD_VISIT', label: '🔍 Escalate for Field / Dealer Verification', color: 'hover:border-indigo-500/50' },
                    { id: 'HOLD_POLICY_REVIEW', label: '⛔ Place on Policy Hold / Senior Review', color: 'hover:border-rose-500/50' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDecisionType(d.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition ${
                        decisionType === d.id
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                          : `bg-slate-900/60 border-slate-800 text-slate-300 ${d.color}`
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Underwriter Notes & Justification:
                </label>
                <textarea
                  rows={3}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="e.g., Reviewed 90-day Swiggy daily credits; verified on-time TNEB bills. Income consistency supports Stage 2 underwriting..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleSaveDecision}
                disabled={savingDecision}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingDecision ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>LOG UNDERWRITING DECISION</span>
              </button>
            </div>
          </div>

          {/* Quick Raw Alternative Transaction Summary */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Consented Records Overview
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                <span className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>UPI Transactions</span>
                </span>
                <span className="font-mono text-slate-200 font-semibold">{upi_transactions?.length || 0} Records</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                <span className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Utility Bill Payments</span>
                </span>
                <span className="font-mono text-slate-200 font-semibold">{utility_payments?.length || 0} Records</span>
              </div>
              {customer?.customer_type === "Merchant" && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-purple-400" />
                    <span>GST-3B Tax Filings</span>
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">{gst_records?.length || 0} Months</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
