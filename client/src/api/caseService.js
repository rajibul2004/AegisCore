import api from './axios';

export const caseService = {
  // Get all cases with pagination and filters
  getCases: async (page = 1, limit = 10, status = '', priority = '') => {
    let url = `/cases?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get single case by ID
  getCaseById: async (id) => {
    const response = await api.get(`/cases/${id}`);
    return response.data;
  },

  // Create new Case from FIR
  createCase: async (caseData) => {
    const response = await api.post('/cases', caseData);
    return response.data;
  },

  // Update case status/priority/officer
  updateCase: async (id, updateData) => {
    const response = await api.patch(`/cases/${id}`, updateData);
    return response.data;
  },

  // Delete case
  deleteCase: async (id) => {
    const response = await api.delete(`/cases/${id}`);
    return response.data;
  }
};
