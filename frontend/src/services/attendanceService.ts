import { api } from './api';

export const attendanceService = {
  async getAttendance(params: any = {}) {
    const res = await api.get('/attendance', { params });
    return res.data;
  },

  async markAttendance(data: any) {
    const res = await api.post('/attendance', data);
    return res.data;
  },
};
