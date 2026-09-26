import api from './axios';

export const firService = {
  // Get all FIRs with pagination and filters
  getFIRs: async (page = 1, limit = 10, status = '', priority = '') => {
    let url = `/firs?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get single FIR by ID
  getFIRById: async (id) => {
    const response = await api.get(`/firs/${id}`);
    return response.data;
  },

  // Create new FIR
  createFIR: async (firData) => {
    const response = await api.post('/firs', firData);
    return response.data;
  },

  // Update FIR status/priority
  updateFIR: async (id, updateData) => {
    const response = await api.patch(`/firs/${id}`, updateData);
    return response.data;
  },

  // Delete FIR
  deleteFIR: async (id) => {
    const response = await api.delete(`/firs/${id}`);
    return response.data;
  }
};
