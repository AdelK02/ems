const auditLogRepository = require('../repositories/auditLog.repository');

class AuditLogService {
  async getAuditLogs(params) {
    return auditLogRepository.findAll(params);
  }
}

module.exports = new AuditLogService();
