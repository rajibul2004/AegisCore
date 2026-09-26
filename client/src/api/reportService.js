import api from './axios';

export const reportService = {
  getReportsByCase: async (caseId) => {
    const response = await api.get(`/reports/case/${caseId}`);
    return response.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  createReport: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  updateReport: async (id, updateData) => {
    const response = await api.patch(`/reports/${id}`, updateData);
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  }
};
