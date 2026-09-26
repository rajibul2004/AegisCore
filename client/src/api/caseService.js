import api from './axios';

export const caseService = {
  getCases: async (page = 1, limit = 10, filters = {}) => {
    let url = `/cases?page=${page}&limit=${limit}`;
    
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.priority) url += `&priority=${filters.priority}`;
    if (filters.search) url += `&search=${filters.search}`;
    if (filters.caseNumber) url += `&caseNumber=${filters.caseNumber}`;
    if (filters.firNumber) url += `&firNumber=${filters.firNumber}`;
    if (filters.startDate) url += `&startDate=${filters.startDate}`;
    if (filters.endDate) url += `&endDate=${filters.endDate}`;
    
    const response = await api.get(url);
    return response.data;
  },

  getCaseById: async (id) => {
    const response = await api.get(`/cases/${id}`);
    return response.data;
  },

  createCase: async (caseData) => {
    const response = await api.post('/cases', caseData);
    return response.data;
  },

  updateCase: async (id, updateData) => {
    const response = await api.patch(`/cases/${id}`, updateData);
    return response.data;
  },

  deleteCase: async (id) => {
    const response = await api.delete(`/cases/${id}`);
    return response.data;
  }
};
