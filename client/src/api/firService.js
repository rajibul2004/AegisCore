import api from './axios';

export const firService = {
  getFIRs: async function (params = {}) {
    let finalParams = params;
    if (typeof params === 'number') {
      finalParams = arguments[2] || {};
      finalParams.page = arguments[0];
      finalParams.limit = arguments[1] || 10;
    }
    
    const response = await api.get('/firs', { params: finalParams });
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
