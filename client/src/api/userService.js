import api from './axios';

export const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  requestRole: async (requestedRole, reason) => {
    const response = await api.post('/users/request-role', { requestedRole, reason });
    return response.data;
  },

  getRoleRequests: async () => {
    const response = await api.get('/users/role-requests');
    return response.data;
  },

  processRoleRequest: async (id, status) => {
    const response = await api.put(`/users/role-requests/${id}/process`, { status });
    return response.data;
  }
};
