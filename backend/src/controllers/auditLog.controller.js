const auditLogService = require('../services/auditLog.service');
const ApiResponse = require('../utils/apiResponse');

class AuditLogController {
  async getAuditLogs(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const { action, resource } = req.query;

      const result = await auditLogService.getAuditLogs({ page, limit, action, resource });
      return ApiResponse.success(res, 'Audit logs retrieved', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditLogController();
