import { api } from './api';

export const roleService = {
  async getRoles() {
    const res = await api.get('/roles');
    return res.data;
  },

  async createRole(data: any) {
    const res = await api.post('/roles', data);
    return res.data;
  },

  async updateRole(id: string, data: any) {
    const res = await api.put(`/roles/${id}`, data);
    return res.data;
  },
};
