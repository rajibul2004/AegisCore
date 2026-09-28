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
    console.log('Creating FIR with data:', firData); // Debugging log
    const response = await api.post('/firs', firData);
    console.log('FIR created:', response.data); // Debugging log
    return response.data;
  },

  updateFIR: async (id, updateData) => {
    const response = await api.patch(`/firs/${id}`, updateData);
    return response.data;
  },

  deleteFIR: async (id) => {
    const response = await api.delete(`/firs/${id}`);
    return response.data;
  },

  getFIRLocations: async () => {
    const response = await api.get('/firs/locations');
    return response.data;
  }
};
