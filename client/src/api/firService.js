import api from './axios';

export const firService = {
  getFIRs: async (page = 1, limit = 10, filters = {}) => {
    let url = `/firs?page=${page}&limit=${limit}`;
    
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.priority) url += `&priority=${filters.priority}`;
    if (filters.search) url += `&search=${filters.search}`;
    if (filters.firNumber) url += `&firNumber=${filters.firNumber}`;
    if (filters.location) url += `&location=${filters.location}`;
    if (filters.startDate) url += `&startDate=${filters.startDate}`;
    if (filters.endDate) url += `&endDate=${filters.endDate}`;
    
    const response = await api.get(url);
    return response.data;
  },

  getFIRById: async (id) => {
    const response = await api.get(`/firs/${id}`);
    return response.data;
  },

  createFIR: async (firData) => {
    const response = await api.post('/firs', firData);
    return response.data;
  },

  updateFIRStatus: async (id, updateData) => {
    const response = await api.patch(`/firs/${id}/status`, updateData);
    return response.data;
  }
};
