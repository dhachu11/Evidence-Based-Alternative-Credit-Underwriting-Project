import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Search, 
  Filter, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck2, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  RefreshCw,
  Building2,
  Bike,
  Briefcase,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';

export const OfficerDashboard = ({ onSelectCustomer }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers();
      setCustomers(res.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone_raw.includes(searchQuery) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'ALL' || c.customer_type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (c.latest_assessment?.evidence_status === statusFilter) ||
      (statusFilter === 'UNASSESSED' && !c.latest_assessment);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate Metrics
  const totalAssessed = customers.filter(c => c.latest_assessment).length;
  const sufficientCount = customers.filter(c => c.latest_assessment?.evidence_status?.includes('SUFFICIENT')).length;
  const limitedCount = customers.filter(c => c.latest_assessment?.evidence_status === 'LIMITED').length;
  const inconsistentCount = customers.filter(c => c.latest_assessment?.evidence_status === 'INCONSISTENT').length;
  const insufficientCount = customers.filter(c => c.latest_assessment?.evidence_status === 'INSUFFICIENT').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Officer Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Loan Officer Workbench
            </span>
            <span className="text-xs text-slate-400">Coimbatore Regional Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Evidence-Based Alternative Credit Underwriting
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Evaluate customer-consented digital financial footprints for new-to-credit (NTC) and thin-file borrowers. Evidence validation precedes ML scoring.
          </p>
        </div>

        <button 
          onClick={fetchCustomers}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition self-start lg:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="glass-panel p-4 rounded-xl border-blue-900/40">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{customers.length}</p>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">Consented borrowers</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border-emerald-900/40">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Sufficient Evidence</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{sufficientCount}</p>
          <span className="text-[10px] text-emerald-300/70 mt-1 block font-mono">Ready for ML risk score</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border-amber-900/40">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Limited Evidence</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{limitedCount}</p>
          <span className="text-[10px] text-amber-300/70 mt-1 block font-mono">Request more records</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border-rose-900/40">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Inconsistent</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">{inconsistentCount}</p>
          <span className="text-[10px] text-rose-300/70 mt-1 block font-mono">Requires manual verification</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border-slate-700/40 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Insufficient (&lt;30d)</span>
            <FileCheck2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-300">{insufficientCount}</p>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">Refuses ML ("I don't know")</span>
        </div>
      </div>

      {/* Primary Persona Showcase Bar */}
      <div className="glass-panel p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-blue-950/60 border-blue-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Fast Demonstration Personas (Click to Inspect)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 italic">Pre-configured test outcomes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {[
            {
              id: "CUST-101",
              name: "Ravi Kumar ⭐ HERO",
              tag: "Gig Worker (90d)",
              sub: "Sufficient + Warning -> 82% Repay Prob",
              color: "border-blue-500/50 bg-blue-950/40 text-blue-200"
            },
            {
              id: "CUST-102",
              name: "Priya Sharma",
              tag: "Salaried First-Timer (45d)",
              sub: "Limited Evidence -> Request Info",
              color: "border-amber-500/40 bg-amber-950/30 text-amber-200"
            },
            {
              id: "CUST-103",
              name: "Arjun Traders",
              tag: "Merchant (GST+UPI)",
              sub: "Sufficient -> 91% Repay Prob",
              color: "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
            },
            {
              id: "CUST-104",
              name: "Vikram Patel",
              tag: "Contractor (Anomaly)",
              sub: "Inconsistent -> Manual Audit",
              color: "border-rose-500/40 bg-rose-950/30 text-rose-200"
            },
            {
              id: "CUST-105",
              name: "Suresh Nair",
              tag: "Auto Driver (15d)",
              sub: "Insufficient -> Refuses Score",
              color: "border-slate-600/50 bg-slate-900/50 text-slate-300"
            }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectCustomer(p.id)}
              className={`p-3 rounded-xl border text-left transition hover:scale-[1.02] hover:shadow-lg ${p.color}`}
            >
              <div className="text-xs font-bold truncate">{p.name}</div>
              <div className="text-[10px] text-slate-300 font-mono mt-0.5">{p.tag}</div>
              <div className="text-[9px] text-slate-400 mt-1 truncate">{p.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, Name, Phone, City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Customer Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Segments</option>
            <option value="Gig Worker">Gig Workers</option>
            <option value="Merchant">Merchants</option>
            <option value="Salaried First-Timer">Salaried NTC</option>
            <option value="Contractor">Contractors</option>
          </select>

          {/* Evidence Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Evidence States</option>
            <option value="SUFFICIENT">Sufficient</option>
            <option value="LIMITED">Limited</option>
            <option value="INCONSISTENT">Inconsistent</option>
            <option value="INSUFFICIENT">Insufficient (&lt;30d)</option>
          </select>
        </div>
      </div>

      {/* Customer Directory Table / Cards */}
      <div className="grid grid-cols-1 gap-3">
        {filteredCustomers.map((c) => {
          const isAssessed = Boolean(c.latest_assessment);
          const evidenceStatus = c.latest_assessment?.evidence_status || "UNASSESSED";
          const recommendation = c.latest_assessment?.recommendation || "Pending Underwriter Execution";

          return (
            <div
              key={c.id}
              onClick={() => onSelectCustomer(c.id)}
              className="glass-panel p-4 rounded-xl glass-card-hover cursor-pointer border-slate-800 hover:border-blue-600/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl mt-0.5 ${
                  c.customer_type === "Gig Worker" 
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : c.customer_type === "Merchant"
                      ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                      : "bg-teal-600/20 text-teal-400 border border-teal-500/30"
                }`}>
                  {c.customer_type === "Gig Worker" && <Bike className="w-5 h-5" />}
                  {c.customer_type === "Merchant" && <Building2 className="w-5 h-5" />}
                  {c.customer_type !== "Gig Worker" && c.customer_type !== "Merchant" && <Briefcase className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white hover:text-blue-400 transition">
                      {c.name}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {c.id}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                      {c.customer_type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 max-w-xl line-clamp-1">
                    {c.headline}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span>Phone: <strong className="text-slate-200 font-mono">{c.phone_masked}</strong></span>
                    <span>Location: <strong className="text-slate-200">{c.location}</strong></span>
                    <span>Bureau: <strong className="text-slate-200">{c.bureau_status}</strong></span>
                  </div>
                </div>
              </div>

              {/* Assessment & Recommendation Preview */}
              <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-left md:text-right">
                  <div className="mb-1">
                    <StatusBadge status={evidenceStatus} size="sm" />
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">
                    {recommendation}
                  </div>
                  {c.latest_assessment?.risk_probability && (
                    <div className="text-[10px] text-blue-300 font-mono mt-0.5">
                      Repayment Prob: {(c.latest_assessment.risk_probability * 100).toFixed(0)}% ({c.latest_assessment.risk_band})
                    </div>
                  )}
                </div>

                <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No matching borrowers found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or role filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
