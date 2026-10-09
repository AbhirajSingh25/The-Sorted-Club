const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

const TOKEN_STORAGE_KEY = 'sorted_admin_token';
const USERNAME_STORAGE_KEY = 'sorted_admin_username';

export function getAdminToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getAdminUsername() {
  return localStorage.getItem(USERNAME_STORAGE_KEY);
}

export function setAdminAuth(token, username) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  if (username) {
    localStorage.setItem(USERNAME_STORAGE_KEY, username);
  }
}

export function clearAdminAuth() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USERNAME_STORAGE_KEY);
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getAdminToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const isJson = (response.headers.get('content-type') || '').includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      const fieldErrors = {};

      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data.detail)) {
          const messages = [];
          data.detail.forEach(errItem => {
            const field = errItem.field || (Array.isArray(errItem.loc) ? errItem.loc[errItem.loc.length - 1] : null);
            const msg = errItem.message || errItem.msg || 'Invalid field value';
            if (field) {
              fieldErrors[field] = msg;
            }
            messages.push(msg);
          });
          errorMessage = messages.join(' • ') || 'Please check the highlighted fields.';
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (typeof data === 'string' && data) {
        errorMessage = data;
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      error.fieldErrors = fieldErrors;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message && err.message.includes('fetch')) {
      const connErr = new Error('Unable to connect to the backend server. Please verify the API is running.');
      connErr.status = 0;
      throw connErr;
    }
    throw err;
  }
}

// Public Lead API
export async function submitLead(leadData) {
  return request('/api/leads', {
    method: 'POST',
    body: JSON.stringify(leadData)
  });
}

export const createLead = submitLead;


// Admin Authentication API
export async function loginAdmin(username, password) {
  const data = await request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  if (data.access_token) {
    setAdminAuth(data.access_token, data.username);
  }
  return data;
}

export async function verifyAdminSession() {
  return request('/api/admin/verify');
}

// Admin Leads & Pipeline Management API
export async function fetchLeadStats() {
  return request('/api/leads/stats');
}

export async function fetchCRMMetrics() {
  return request('/api/leads/crm-stats');
}

export async function fetchLeads({
  status = '',
  service_interest = '',
  priority = '',
  source = '',
  assigned_to = '',
  follow_up_filter = '',
  search = '',
  sort_by = 'newest'
} = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (service_interest && service_interest !== 'ALL') params.append('service_interest', service_interest);
  if (priority && priority !== 'ALL') params.append('priority', priority);
  if (source && source !== 'ALL') params.append('source', source);
  if (assigned_to && assigned_to !== 'ALL') params.append('assigned_to', assigned_to);
  if (follow_up_filter && follow_up_filter !== 'ALL') params.append('follow_up_filter', follow_up_filter);
  if (search && search.trim()) params.append('search', search.trim());
  if (sort_by) params.append('sort_by', sort_by);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/api/leads${query}`);
}

export async function fetchLead(id) {
  return request(`/api/leads/${id}`);
}

export async function updateLead(id, updateData) {
  return request(`/api/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  });
}

export async function deleteLead(id) {
  return request(`/api/leads/${id}`, {
    method: 'DELETE'
  });
}

// Lead Activity & Timeline API
export async function fetchLeadActivities(leadId) {
  return request(`/api/leads/${leadId}/activities`);
}

export async function createLeadActivity(leadId, activityData) {
  return request(`/api/leads/${leadId}/activities`, {
    method: 'POST',
    body: JSON.stringify(activityData)
  });
}

// ==============================================================================
// CLIENTS & ONBOARDING API
// ==============================================================================

export async function convertLeadToClient(leadId) {
  return request(`/api/clients/from-lead/${leadId}`, {
    method: 'POST'
  });
}

export async function fetchClientStats() {
  return request('/api/clients/stats');
}

export async function fetchClients({
  status = '',
  onboarding_status = '',
  assigned_to = '',
  search = '',
  sort_by = 'newest'
} = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (onboarding_status && onboarding_status !== 'ALL') params.append('onboarding_status', onboarding_status);
  if (assigned_to && assigned_to !== 'ALL') params.append('assigned_to', assigned_to);
  if (search && search.trim()) params.append('search', search.trim());
  if (sort_by) params.append('sort_by', sort_by);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/api/clients${query}`);
}

export async function fetchClient(id) {
  return request(`/api/clients/${id}`);
}

export async function updateClient(id, updateData) {
  return request(`/api/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  });
}

export async function fetchClientOnboarding(id) {
  return request(`/api/clients/${id}/onboarding`);
}

export async function updateClientOnboarding(id, { items = [], onboarding_status = null } = {}) {
  const payload = { items };
  if (onboarding_status) {
    payload.onboarding_status = onboarding_status;
  }
  return request(`/api/clients/${id}/onboarding`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function fetchClientActivities(clientId) {
  return request(`/api/clients/${clientId}/activities`);
}

export async function createClientActivity(clientId, activityData) {
  return request(`/api/clients/${clientId}/activities`, {
    method: 'POST',
    body: JSON.stringify(activityData)
  });
}

// ==============================================================================
// COMMERCIAL WORKFLOW: PROPOSALS, CONTRACTS, INVOICES, PAYMENTS, FINANCE
// ==============================================================================

// Proposals API
export async function fetchProposals({
  status = '',
  client_id = null,
  search = '',
  sort_by = 'newest'
} = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (client_id) params.append('client_id', client_id);
  if (search && search.trim()) params.append('search', search.trim());
  if (sort_by) params.append('sort_by', sort_by);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/api/proposals${query}`);
}

export async function fetchProposal(id) {
  return request(`/api/proposals/${id}`);
}

export async function createProposal(proposalData) {
  return request('/api/proposals', {
    method: 'POST',
    body: JSON.stringify(proposalData)
  });
}

export async function updateProposal(id, updateData) {
  return request(`/api/proposals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  });
}

export async function deleteProposal(id) {
  return request(`/api/proposals/${id}`, {
    method: 'DELETE'
  });
}

export async function sendProposal(id) {
  return request(`/api/proposals/${id}/send`, {
    method: 'POST'
  });
}

export async function acceptProposalAdmin(id) {
  return request(`/api/proposals/${id}/accept`, {
    method: 'POST'
  });
}

export async function rejectProposalAdmin(id) {
  return request(`/api/proposals/${id}/reject`, {
    method: 'POST'
  });
}

export async function duplicateProposal(id) {
  return request(`/api/proposals/${id}/duplicate`, {
    method: 'POST'
  });
}

// Public Proposal Approval API (No Auth)
export async function fetchPublicProposal(token) {
  return request(`/api/public/proposal/${token}`);
}

export async function acceptPublicProposal(token, { accepted_by_name, accepted_by_email }) {
  return request(`/api/public/proposal/${token}/accept`, {
    method: 'POST',
    body: JSON.stringify({ accepted_by_name, accepted_by_email })
  });
}

export async function rejectPublicProposal(token, { reason = '' } = {}) {
  return request(`/api/public/proposal/${token}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
}

// Contracts API
export async function fetchContracts({
  status = '',
  client_id = null,
  search = ''
} = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (client_id) params.append('client_id', client_id);
  if (search && search.trim()) params.append('search', search.trim());

  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/api/contracts${query}`);
}

export async function fetchContract(id) {
  return request(`/api/contracts/${id}`);
}

export async function createContractFromProposal(proposalId) {
  return request(`/api/contracts/from-proposal/${proposalId}`, {
    method: 'POST'
  });
}

export async function updateContract(id, updateData) {
  return request(`/api/contracts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  });
}

export async function sendContract(id) {
  return request(`/api/contracts/${id}/send`, {
    method: 'POST'
  });
}

export async function acceptContract(id) {
  return request(`/api/contracts/${id}/accept`, {
    method: 'POST'
  });
}

// Public Contract API (No Auth)
export async function fetchPublicContract(token) {
  return request(`/api/public/contract/${token}`);
}

export async function acceptPublicContract(token, { accepted_by_name, accepted_by_email }) {
  return request(`/api/public/contract/${token}/accept`, {
    method: 'POST',
    body: JSON.stringify({ accepted_by_name, accepted_by_email })
  });
}

// Invoices & Payments API
export async function fetchInvoices({
  status = '',
  client_id = null,
  is_overdue = null,
  search = '',
  sort_by = 'newest'
} = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (client_id) params.append('client_id', client_id);
  if (is_overdue !== null) params.append('is_overdue', is_overdue);
  if (search && search.trim()) params.append('search', search.trim());
  if (sort_by) params.append('sort_by', sort_by);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/api/invoices${query}`);
}

export async function fetchInvoice(id) {
  return request(`/api/invoices/${id}`);
}

export async function createInvoice(invoiceData) {
  return request('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(invoiceData)
  });
}

export async function createInvoiceFromProposal(proposalId) {
  return request(`/api/invoices/from-proposal/${proposalId}`, {
    method: 'POST'
  });
}

export async function updateInvoice(id, updateData) {
  return request(`/api/invoices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  });
}

export async function deleteInvoice(id) {
  return request(`/api/invoices/${id}`, {
    method: 'DELETE'
  });
}

export async function sendInvoice(id) {
  return request(`/api/invoices/${id}/send`, {
    method: 'POST'
  });
}

export async function recordInvoicePayment(invoiceId, paymentData) {
  return request(`/api/invoices/${invoiceId}/payments`, {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
}

export async function fetchInvoicePayments(invoiceId) {
  return request(`/api/invoices/${invoiceId}/payments`);
}

// Public Invoice & Payment Verification API (No Auth)
export async function fetchPublicInvoice(token) {
  return request(`/api/public/invoice/${token}`);
}

export async function submitPublicPaymentConfirmation(token, confirmationData) {
  return request(`/api/public/invoice/${token}/confirm-payment`, {
    method: 'POST',
    body: JSON.stringify(confirmationData)
  });
}

// Finance Statistics & Payment Verification API
export async function fetchFinanceStats() {
  return request('/api/finance/stats');
}

export async function fetchPaymentConfirmations({ status = '' } = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/api/finance/payment-confirmations${query}`);
}

export async function confirmPaymentVerification(id) {
  return request(`/api/finance/payment-confirmations/${id}/confirm`, {
    method: 'POST'
  });
}

export async function rejectPaymentVerification(id, reason = '') {
  return request(`/api/finance/payment-confirmations/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
}

// ============================================================================
// PROJECT DELIVERY & SERVICE MANAGEMENT API
// ============================================================================

export async function fetchProjects({
  status = '',
  service_type = '',
  priority = '',
  assigned_to = '',
  client_id = null,
  search = '',
  sort_by = 'newest'
} = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (service_type && service_type !== 'ALL') params.append('service_type', service_type);
  if (priority && priority !== 'ALL') params.append('priority', priority);
  if (assigned_to && assigned_to !== 'ALL') params.append('assigned_to', assigned_to);
  if (client_id) params.append('client_id', client_id);
  if (search && search.trim()) params.append('search', search.trim());
  if (sort_by) params.append('sort_by', sort_by);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/api/projects${query}`);
}

export async function fetchProjectStats() {
  return request('/api/projects/stats');
}

export async function fetchProject(id) {
  return request(`/api/projects/${id}`);
}

export async function createProject(projectData) {
  return request('/api/projects', {
    method: 'POST',
    body: JSON.stringify(projectData)
  });
}

export async function updateProject(id, updateData) {
  return request(`/api/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  });
}

export async function deleteProject(id) {
  return request(`/api/projects/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchProjectTasks(projectId) {
  return request(`/api/projects/${projectId}/tasks`);
}

export async function createProjectTask(projectId, taskData) {
  return request(`/api/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
}

export async function updateProjectTask(projectId, taskId, taskData) {
  return request(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(taskData)
  });
}

export async function deleteProjectTask(projectId, taskId) {
  return request(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: 'DELETE'
  });
}

export async function fetchProjectActivities(projectId) {
  return request(`/api/projects/${projectId}/activities`);
}

export async function createProjectActivity(projectId, activityData) {
  return request(`/api/projects/${projectId}/activities`, {
    method: 'POST',
    body: JSON.stringify(activityData)
  });
}

export async function fetchProjectResources(projectId) {
  return request(`/api/projects/${projectId}/resources`);
}

export async function createProjectResource(projectId, resourceData) {
  return request(`/api/projects/${projectId}/resources`, {
    method: 'POST',
    body: JSON.stringify(resourceData)
  });
}

export async function updateProjectResource(projectId, resourceId, resourceData) {
  return request(`/api/projects/${projectId}/resources/${resourceId}`, {
    method: 'PATCH',
    body: JSON.stringify(resourceData)
  });
}

export async function deleteProjectResource(projectId, resourceId) {
  return request(`/api/projects/${projectId}/resources/${resourceId}`, {
    method: 'DELETE'
  });
}

// Build Project Brief & Discovery Checklist
export async function fetchProjectBrief(projectId) {
  return request(`/api/projects/${projectId}/brief`);
}

export async function updateProjectBrief(projectId, briefData) {
  return request(`/api/projects/${projectId}/brief`, {
    method: 'PUT',
    body: JSON.stringify(briefData)
  });
}

// Project Milestones API
export async function fetchProjectMilestones(projectId) {
  return request(`/api/projects/${projectId}/milestones`);
}

export async function createProjectMilestone(projectId, milestoneData) {
  return request(`/api/projects/${projectId}/milestones`, {
    method: 'POST',
    body: JSON.stringify(milestoneData)
  });
}

export async function updateProjectMilestone(projectId, milestoneId, milestoneData) {
  return request(`/api/projects/${projectId}/milestones/${milestoneId}`, {
    method: 'PATCH',
    body: JSON.stringify(milestoneData)
  });
}

export async function deleteProjectMilestone(projectId, milestoneId) {
  return request(`/api/projects/${projectId}/milestones/${milestoneId}`, {
    method: 'DELETE'
  });
}

// Project Approvals API
export async function fetchProjectApprovals(projectId) {
  return request(`/api/projects/${projectId}/approvals`);
}

export async function createProjectApproval(projectId, approvalData) {
  return request(`/api/projects/${projectId}/approvals`, {
    method: 'POST',
    body: JSON.stringify(approvalData)
  });
}

export async function deleteProjectApproval(projectId, approvalId) {
  return request(`/api/projects/${projectId}/approvals/${approvalId}`, {
    method: 'DELETE'
  });
}

// Project Announcements / Updates API
export async function fetchProjectUpdates(projectId) {
  return request(`/api/projects/${projectId}/updates`);
}

export async function createProjectUpdate(projectId, updateData) {
  return request(`/api/projects/${projectId}/updates`, {
    method: 'POST',
    body: JSON.stringify(updateData)
  });
}

export async function deleteProjectUpdate(projectId, updateId) {
  return request(`/api/projects/${projectId}/updates/${updateId}`, {
    method: 'DELETE'
  });
}

// Handover & Strict Completion API
export async function updateProjectHandover(projectId, handoverData) {
  return request(`/api/projects/${projectId}/handover`, {
    method: 'PATCH',
    body: JSON.stringify(handoverData)
  });
}

export async function completeProject(projectId) {
  return request(`/api/projects/${projectId}/complete`, {
    method: 'POST'
  });
}

// ==============================================================================
// PUBLIC CUSTOMER PROJECT & APPROVAL APIS
// ==============================================================================

export async function fetchPublicProject(token) {
  return request(`/api/public/project/${token}`);
}

export async function fetchPublicApproval(token) {
  return request(`/api/public/approval/${token}`);
}

export async function submitPublicApprovalDecision(token, decisionData) {
  return request(`/api/public/approval/${token}/decision`, {
    method: 'POST',
    body: JSON.stringify(decisionData)
  });
}

// ==============================================================================
// ADMIN NOTIFICATIONS & EMAIL LOGS API
// ==============================================================================

export async function fetchNotifications({ unread_only = false, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (unread_only) params.append('unread_only', 'true');
  if (limit) params.append('limit', limit);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/api/notifications${query}`);
}

export async function markNotificationRead(id) {
  return request(`/api/notifications/${id}/read`, {
    method: 'PATCH'
  });
}

export async function markAllNotificationsRead() {
  return request('/api/notifications/mark-all-read', {
    method: 'POST'
  });
}

export async function deleteNotification(id) {
  return request(`/api/notifications/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchEmailLogs(limit = 50) {
  return request(`/api/notifications/email-logs?limit=${limit}`);
}

// ==============================================================================
// ADMIN COMMAND CENTER & BOS API
// ==============================================================================

export async function fetchCommandCenterMetrics() {
  return request('/api/admin/command-center');
}

export async function completeLeadFollowUp(leadId, followUpData = {}) {
  return request(`/api/leads/${leadId}/complete-follow-up`, {
    method: 'POST',
    body: JSON.stringify(followUpData)
  });
}

// ==============================================================================
// ADMIN ACCOUNT SECURITY, WEB PUSH & SETTINGS API
// ==============================================================================

export async function changeAdminUsername(data) {
  const res = await request('/api/admin/change-username', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (res && res.access_token) {
    setAdminAuth(res.access_token, res.username);
  }
  return res;
}

export async function changeAdminPassword(data) {
  const res = await request('/api/admin/change-password', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (res && res.access_token) {
    setAdminAuth(res.access_token, res.username);
  }
  return res;
}

export async function fetchAdminSettings() {
  return request('/api/admin/settings');
}

export async function fetchVapidPublicKey() {
  return request('/api/notifications/vapid-public-key');
}

export async function subscribeToPushNotifications(subscriptionData) {
  return request('/api/notifications/push-subscriptions', {
    method: 'POST',
    body: JSON.stringify(subscriptionData)
  });
}

export async function unsubscribeFromPushNotifications(endpoint) {
  return request('/api/notifications/push-subscriptions', {
    method: 'DELETE',
    body: JSON.stringify({ endpoint })
  });
}

export async function testPushNotification() {
  return request('/api/notifications/test-push', {
    method: 'POST'
  });
}

export async function fetchPushLogs(limit = 50) {
  return request(`/api/notifications/push-logs?limit=${limit}`);
}



