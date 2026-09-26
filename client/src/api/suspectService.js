import api from './axios';

export const suspectService = {
  getSuspects: async (page = 1, limit = 10, search = '', status = '') => {
    let url = `/suspects?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (status) url += `&status=${status}`;
    const response = await api.get(url);
    return response.data;
  },

  getSuspectById: async (id) => {
    const response = await api.get(`/suspects/${id}`);
    return response.data;
  },

  createSuspect: async (suspectData) => {
    const response = await api.post('/suspects', suspectData);
    return response.data;
  },

  updateSuspect: async (id, updateData) => {
    const response = await api.patch(`/suspects/${id}`, updateData);
    return response.data;
  },

  linkToCase: async (id, caseId) => {
    const response = await api.post(`/suspects/${id}/link`, { caseId });
    return response.data;
  }
};
