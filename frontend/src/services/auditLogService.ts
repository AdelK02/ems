import { api } from './api';

export const auditLogService = {
  async getAuditLogs(params: any = {}) {
    const res = await api.get('/audit-logs', { params });
    return res.data;
  },
};
