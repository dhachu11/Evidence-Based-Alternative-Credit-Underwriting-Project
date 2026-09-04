import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { LandingPage } from './pages/LandingPage';
import { CustomerPortal } from './pages/customer/CustomerPortal';
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { CustomerAssessmentDetail } from './pages/officer/CustomerAssessmentDetail';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('officer'); // Default to main portal
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const handleSelectCustomer = (id) => {
    setSelectedCustomerId(id);
    setActiveTab('officer');
  };

  return (
    <div className="min-h-screen bg-[#071322] flex flex-col">
      {/* Top TVS Prototype Disclaimer */}
      <DisclaimerBanner />

      {/* Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'officer') {
            setSelectedCustomerId(null);
          }
        }}
        selectedCustomerId={selectedCustomerId}
        setSelectedCustomerId={setSelectedCustomerId}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'landing' && (
          <LandingPage
            onSelectPortal={(tab) => setActiveTab(tab)}
            onSelectCustomer={(id) => setSelectedCustomerId(id)}
          />
        )}

        {activeTab === 'customer' && (
          <CustomerPortal
            customerId={selectedCustomerId || user?.customer_id || "CUST-101"}
          />
        )}

        {activeTab === 'officer' && !selectedCustomerId && (
          <OfficerDashboard
            onSelectCustomer={(id) => setSelectedCustomerId(id)}
          />
        )}

        {activeTab === 'officer' && selectedCustomerId && (
          <CustomerAssessmentDetail
            customerId={selectedCustomerId}
            onBack={() => setSelectedCustomerId(null)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#050E1A] border-t border-slate-900 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-300">TVS Credit Decision Engine</span> — Evidence-Based Alternative Underwriting Prototype
            <p className="text-[10px] text-slate-500 mt-0.5">
              Built for TVS Credit Hackathon. Decision-support platform for thin-file borrowers.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setActiveTab('landing')} className="hover:text-blue-400 transition">
              Overview
            </button>
            <button onClick={() => { setActiveTab('officer'); setSelectedCustomerId(null); }} className="hover:text-blue-400 transition">
              Loan Officer
            </button>
            <button onClick={() => { setActiveTab('customer'); setSelectedCustomerId('CUST-101'); }} className="hover:text-blue-400 transition">
              Consent Center
            </button>
            <button onClick={() => setActiveTab('admin')} className="hover:text-blue-400 transition">
              Model Monitoring
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
