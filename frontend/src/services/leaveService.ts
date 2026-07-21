import { api } from './api';

export const leaveService = {
  async getLeaves(params: any = {}) {
    const res = await api.get('/leaves', { params });
    return res.data;
  },

  async applyLeave(data: any) {
    const res = await api.post('/leaves', data);
    return res.data;
  },

  async updateLeaveStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const res = await api.patch(`/leaves/${id}/status`, { status });
    return res.data;
  },
};
