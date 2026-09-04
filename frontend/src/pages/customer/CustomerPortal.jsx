import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Zap, 
  ReceiptText, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  FileText, 
  ArrowRight, 
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';

export const CustomerPortal = ({ customerId = "CUST-101" }) => {
  const { user } = useAuth();
  const [activeCustId, setActiveCustId] = useState(customerId);
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingConsent, setSavingConsent] = useState(false);
  const [consentSuccessMsg, setConsentSuccessMsg] = useState(null);

  // Form states for consent
  const [upiAllowed, setUpiAllowed] = useState(true);
  const [utilityAllowed, setUtilityAllowed] = useState(true);
  const [gstAllowed, setGstAllowed] = useState(false);
  const [dataPeriod, setDataPeriod] = useState(90);

  const fetchDetails = async (id) => {
    setLoading(true);
    try {
      const res = await api.getCustomerDetails(id);
      setCustomerData(res);
      if (res.consent) {
        setUpiAllowed(Boolean(res.consent.upi_allowed));
        setUtilityAllowed(Boolean(res.consent.utility_allowed));
        setGstAllowed(Boolean(res.consent.gst_allowed));
        setDataPeriod(res.consent.data_period_days || 90);
      }
    } catch (err) {
      console.error('Error loading customer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails(activeCustId);
  }, [activeCustId]);

  const handleSaveConsent = async () => {
    setSavingConsent(true);
    setConsentSuccessMsg(null);
    try {
      await api.updateConsent({
        customer_id: activeCustId,
        upi_allowed: upiAllowed,
        utility_allowed: utilityAllowed,
        gst_allowed: gstAllowed,
        data_period_days: dataPeriod,
        purpose: "Credit assessment",
        consent_status: "ACTIVE"
      });
      setConsentSuccessMsg("Consent successfully recorded. Alternative evidence is now securely accessible for underwriting.");
      await fetchDetails(activeCustId);
    } catch (err) {
      alert("Failed to update consent: " + err.message);
    } finally {
      setSavingConsent(false);
      setTimeout(() => setConsentSuccessMsg(null), 5000);
    }
  };

  const handleRevokeConsent = async () => {
    if (!window.confirm("Are you sure you want to revoke all data permissions? Your pending underwriting assessment will be placed on hold.")) {
      return;
    }
    setSavingConsent(true);
    try {
      await api.revokeConsent(activeCustId);
      setConsentSuccessMsg("All alternative data permissions have been revoked.");
      await fetchDetails(activeCustId);
    } catch (err) {
      alert("Failed to revoke consent: " + err.message);
    } finally {
      setSavingConsent(false);
    }
  };

  if (loading && !customerData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading Customer Consent Center...</p>
        </div>
      </div>
    );
  }

  const { customer, consent, upi_transactions, utility_payments, gst_records, latest_assessment } = customerData || {};
  const isMerchant = customer?.customer_type === "Merchant";
  const isConsentActive = consent?.consent_status === "ACTIVE";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Customer Header */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Customer Portal
              </span>
              <span className="text-xs text-slate-400">ID: {customer?.id}</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome, {customer?.name}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {customer?.headline}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Type: <strong className="text-slate-200">{customer?.customer_type}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                Location: <strong className="text-slate-200">{customer?.location}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                Bureau Record: <strong className="text-slate-200">{customer?.bureau_status}</strong>
              </span>
            </div>
          </div>

          {/* Quick Persona Switcher for Hackathon Evaluation */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              View Persona In Customer Portal:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "CUST-101", label: "Ravi (Hero / 90d Gig)" },
                { id: "CUST-102", label: "Priya (45d Limited)" },
                { id: "CUST-103", label: "Arjun (Merchant / GST)" },
                { id: "CUST-105", label: "Suresh (15d Insufficient)" }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveCustId(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    activeCustId === p.id 
                      ? "bg-blue-600 text-white shadow" 
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {consentSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-200 text-sm flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{consentSuccessMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Consent Center */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Consent & Data Permissions</h2>
                  <p className="text-xs text-slate-400">Select which alternative data streams you authorize TVS Credit to inspect</p>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                isConsentActive 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
              }`}>
                <span className={`w-2 h-2 rounded-full ${isConsentActive ? "bg-emerald-400" : "bg-rose-400"}`} />
                <span>{isConsentActive ? "CONSENT ACTIVE" : "CONSENT REVOKED"}</span>
              </div>
            </div>

            {/* Permission Toggles */}
            <div className="space-y-3 mt-5">
              {/* UPI Option */}
              <div className={`p-4 rounded-xl border transition-all ${
                upiAllowed ? "bg-blue-950/20 border-blue-600/40" : "bg-slate-900/40 border-slate-800"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">UPI & Bank Inflows</h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                          {upi_transactions?.length || 0} Transactions Found
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Used to verify monthly income velocity, transaction stability, and cash flow consistency.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3">
                    <input
                      type="checkbox"
                      checked={upiAllowed}
                      onChange={(e) => setUpiAllowed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Utility Option */}
              <div className={`p-4 rounded-xl border transition-all ${
                utilityAllowed ? "bg-blue-950/20 border-blue-600/40" : "bg-slate-900/40 border-slate-800"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">Utility Bill Track Record</h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                          {utility_payments?.length || 0} Bills Checked
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Used to verify recurring payment discipline on electricity (TNEB), broadband, and mobile bills.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3">
                    <input
                      type="checkbox"
                      checked={utilityAllowed}
                      onChange={(e) => setUtilityAllowed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* GST Option (Merchant only) */}
              <div className={`p-4 rounded-xl border transition-all ${
                isMerchant 
                  ? (gstAllowed ? "bg-blue-950/20 border-blue-600/40" : "bg-slate-900/40 border-slate-800")
                  : "bg-slate-900/20 border-slate-800/40 opacity-60"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5">
                      <ReceiptText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">GST Returns & Turnover</h4>
                        {isMerchant ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                            {gst_records?.length || 0} Returns Available
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-400">
                            — Not Applicable for Gig Workers
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {isMerchant 
                          ? "Used for small business turnover verification and GST-3B tax payment regularity."
                          : "Not required for individual gig or salaried workers."}
                      </p>
                    </div>
                  </div>
                  {isMerchant ? (
                    <label className="relative inline-flex items-center cursor-pointer ml-3">
                      <input
                        type="checkbox"
                        checked={gstAllowed}
                        onChange={(e) => setGstAllowed(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  ) : (
                    <span className="text-xs text-slate-500 italic ml-3">N/A</span>
                  )}
                </div>
              </div>
            </div>

            {/* Scope Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-800">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>
                  Authorized Data Period: <strong className="text-white">Last {dataPeriod} Days</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>
                  Declared Purpose: <strong className="text-white">Credit assessment only</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-800">
              <button
                onClick={handleRevokeConsent}
                disabled={savingConsent || !isConsentActive}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/40 transition disabled:opacity-40"
              >
                Revoke All Consent
              </button>

              <button
                onClick={handleSaveConsent}
                disabled={savingConsent}
                className="px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/30 transition flex items-center gap-2"
              >
                {savingConsent ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>GIVE / UPDATE CONSENT</span>
              </button>
            </div>
          </div>

          {/* Consented Financial Activity Stream */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Consented Alternative Activity Trail</h3>
            <p className="text-xs text-slate-400 mb-4">Sample transactions verified through authorized digital sources</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* UPI Streams */}
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-2">
                  <span>Recent UPI Inflows</span>
                  <span className="text-[10px] text-blue-400 font-mono">
                    {upi_transactions?.filter(t => t.transaction_type === 'credit').length || 0} Credits
                  </span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {upi_transactions?.slice(0, 5).map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/50">
                      <div>
                        <p className="text-slate-200 font-medium">{t.counterparty || t.category}</p>
                        <p className="text-[10px] text-slate-500">{t.date}</p>
                      </div>
                      <span className={`font-mono font-semibold ${t.transaction_type === 'credit' ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {t.transaction_type === 'credit' ? '+' : '-'}₹{t.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Utility Stream */}
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-2">
                  <span>Utility Payment Records</span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {utility_payments?.length || 0} Bills
                  </span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {utility_payments?.slice(0, 5).map((u, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/50">
                      <div>
                        <p className="text-slate-200 font-medium">{u.bill_type}</p>
                        <p className="text-[10px] text-slate-500">Due: {u.due_date}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-300 font-mono">₹{u.amount}</span>
                        <p className={`text-[10px] font-semibold ${u.status === 'PAID_ON_TIME' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {u.status.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Assessment Status & Transparency */}
        <div className="space-y-6">
          {/* Assessment Status Card */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Underwriting Assessment Status</h3>
            <p className="text-xs text-slate-400 mb-4">Current stage in the TVS Credit decision-support pipeline</p>

            {latest_assessment ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Evidence Reliability
                  </span>
                  <StatusBadge status={latest_assessment.evidence_status} />
                  <p className="text-xs text-slate-300 mt-2">
                    {latest_assessment.recommendation === "PROCEED TO FURTHER UNDERWRITING"
                      ? "Sufficient verified alternative data trail. Profile ready for loan officer review."
                      : "Additional financial verification or manual branch interview required."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/30">
                  <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider block mb-1">
                    Next Underwriting Step
                  </span>
                  <span className="text-xs font-bold text-white">
                    {latest_assessment.recommendation}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Last evaluated: {new Date(latest_assessment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-white">Assessment In Progress</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Your consented alternative data is ready. The loan officer will execute the evidence validation workflow.
                </p>
              </div>
            )}
          </div>

          {/* Data Transparency & Rights */}
          <div className="glass-panel rounded-2xl p-6 border-blue-900/50 bg-gradient-to-b from-blue-950/40 to-slate-900/60">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-bold text-white">Your Data Privacy & Control</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Your alternative data is used exclusively for TVS Credit underwriting.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>You can revoke or modify data stream permissions at any time.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>No automated rejection: a human loan officer always oversees the final decision.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
