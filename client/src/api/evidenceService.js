import api from './axios';

export const evidenceService = {
  getEvidenceByCase: async (caseId) => {
    const response = await api.get(`/evidence/case/${caseId}`);
    return response.data;
  },

  // Notice: evidenceData must be a FormData object, not a standard JSON payload
  uploadEvidence: async (evidenceFormData) => {
    const response = await api.post('/evidence', evidenceFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteEvidence: async (id) => {
    const response = await api.delete(`/evidence/${id}`);
    return response.data;
  }
};
