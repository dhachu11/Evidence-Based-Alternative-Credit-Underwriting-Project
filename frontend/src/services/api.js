const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('tvs_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const err = await res.json();
      errorDetail = err.detail || errorDetail;
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return res.json();
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Health
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Customers
  getCustomers: async () => {
    const res = await fetch(`${API_BASE}/customers`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getCustomerDetails: async (customerId) => {
    const res = await fetch(`${API_BASE}/customers/${customerId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Consent
  getConsent: async (customerId) => {
    const res = await fetch(`${API_BASE}/consent/${customerId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateConsent: async (consentData) => {
    const res = await fetch(`${API_BASE}/consent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(consentData)
    });
    return handleResponse(res);
  },

  revokeConsent: async (customerId) => {
    const res = await fetch(`${API_BASE}/consent/revoke/${customerId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Assessment & Evidence
  getEvidenceValidation: async (customerId) => {
    const res = await fetch(`${API_BASE}/evidence/${customerId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  runAssessment: async (customerId, preferredModel = 'xgboost') => {
    const res = await fetch(`${API_BASE}/assessment/${customerId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ preferred_model: preferredModel })
    });
    return handleResponse(res);
  },

  recordUnderwritingDecision: async (assessmentId, decisionData) => {
    const res = await fetch(`${API_BASE}/assessment/${assessmentId}/decision`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(decisionData)
    });
    return handleResponse(res);
  },

  // Admin
  getAdminMetrics: async () => {
    const res = await fetch(`${API_BASE}/admin/metrics`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getThresholds: async () => {
    const res = await fetch(`${API_BASE}/admin/thresholds`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateThresholds: async (thresholdData) => {
    const res = await fetch(`${API_BASE}/admin/thresholds`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(thresholdData)
    });
    return handleResponse(res);
  },

  getAuditLogs: async (limit = 50) => {
    const res = await fetch(`${API_BASE}/admin/audit-logs?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getRetailerInsights: async () => {
    const res = await fetch(`${API_BASE}/admin/retailer-insights`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateRetailerInsights: async (insightsData) => {
    const res = await fetch(`${API_BASE}/admin/retailer-insights`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(insightsData)
    });
    return handleResponse(res);
  }
};
