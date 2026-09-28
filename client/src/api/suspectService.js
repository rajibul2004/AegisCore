import api from './axios';

export const suspectService = {
  getSuspects: async (page = 1, limit = 10, filters = {}) => {
    const response = await api.get('/suspects', { params: { page, limit, ...filters } });
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
