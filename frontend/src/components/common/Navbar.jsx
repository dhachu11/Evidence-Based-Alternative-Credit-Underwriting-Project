import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, Settings, Users, LogOut, ArrowRightLeft, Sparkles } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, selectedCustomerId, setSelectedCustomerId }) => {
  const { user, quickSwitchRole, logout } = useAuth();

  return (
    <header className="bg-[#0B1E36] border-b border-blue-900/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('officer')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg border border-blue-400/30">
              <span className="font-black text-white text-lg tracking-tighter">TVS</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-base sm:text-lg">TVS CREDIT</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  DECISION ENGINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Evidence-Based Alternative Credit Underwriting</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('officer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'officer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Loan Officer Portal</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">⭐ MAIN</span>
            </button>

            <button
              onClick={() => setActiveTab('customer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'customer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin & Monitoring</span>
            </button>
          </nav>

          {/* Persona Switcher & User Profile */}
          <div className="flex items-center gap-2">
            {/* Quick Demo Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-950/70 border border-blue-800/70 text-blue-300 text-xs hover:bg-blue-900/60 transition">
                <ArrowRightLeft className="w-3 h-3 text-blue-400" />
                <span className="hidden sm:inline">Switch Role:</span>
                <span className="font-semibold text-white capitalize">{user?.role?.replace('_', ' ') || 'Guest'}</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-64 bg-[#0D2340] border border-blue-700/60 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                  1-Click Role Switcher
                </div>
                <button
                  onClick={() => { quickSwitchRole('loan_officer'); setActiveTab('officer'); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-blue-600/30 flex items-center justify-between"
                >
                  <span>Loan Officer (Arunachalam)</span>
                  <span className="text-[10px] text-amber-300 bg-amber-500/20 px-1 rounded">Underwriter</span>
                </button>
                <button
                  onClick={() => { quickSwitchRole('admin'); setActiveTab('admin'); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-blue-600/30 flex items-center justify-between"
                >
                  <span>Admin / CRO (Lakshmi N.)</span>
                  <span className="text-[10px] text-purple-300 bg-purple-500/20 px-1 rounded">Risk HQ</span>
                </button>
                <div className="border-t border-slate-700 my-1"></div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-0.5">
                  Demo Borrower Views
                </div>
                <button
                  onClick={() => { quickSwitchRole('customer', 'CUST-101'); setSelectedCustomerId('CUST-101'); setActiveTab('customer'); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-blue-600/30 flex items-center justify-between"
                >
                  <span>Ravi Kumar (Hero / Gig Worker)</span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1 rounded">90d Stable</span>
                </button>
                <button
                  onClick={() => { quickSwitchRole('customer', 'CUST-102'); setSelectedCustomerId('CUST-102'); setActiveTab('customer'); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-blue-600/30 flex items-center justify-between"
                >
                  <span>Priya Sharma (First-Timer)</span>
                  <span className="text-[10px] text-amber-300 bg-amber-500/20 px-1 rounded">45d Limited</span>
                </button>
                <button
                  onClick={() => { quickSwitchRole('customer', 'CUST-105'); setSelectedCustomerId('CUST-105'); setActiveTab('customer'); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-blue-600/30 flex items-center justify-between"
                >
                  <span>Suresh Nair (Auto Driver)</span>
                  <span className="text-[10px] text-slate-300 bg-slate-700 px-1 rounded">15d Insufficient</span>
                </button>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={() => logout()}
              className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('officer')}
            className={`px-3 py-1 rounded-md ${activeTab === 'officer' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400'}`}
          >
            Officer
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-3 py-1 rounded-md ${activeTab === 'customer' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400'}`}
          >
            Customer
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1 rounded-md ${activeTab === 'admin' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400'}`}
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
};
