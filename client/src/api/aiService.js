import api from './axios';

export const aiService = {
  getLogs: async (params = {}) => {
    const response = await api.get('/ai/logs', { params });
    return response.data;
  },

  testPrompt: async (prompt) => {
    const response = await api.post('/ai/test', { prompt });
    return response.data;
  },

  analyzeCase: async (caseData) => {
    const response = await api.post('/ai/analyze-case', { caseData });
    return response.data;
  }
};
