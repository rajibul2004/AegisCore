import api from './axios';

export const auditService = {
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/audit', { params });
    return response.data;
  }
};
