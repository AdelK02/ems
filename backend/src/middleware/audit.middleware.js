const auditLogRepository = require('../repositories/auditLog.repository');

const logAudit = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
      res.send = originalSend;

      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = req.user ? req.user.userId : null;
          const userEmail = req.user ? req.user.email : 'System/Anonymous';
          const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
          const userAgent = req.headers['user-agent'];
          const resourceId = req.params.id || (req.body && req.body._id) || null;

          auditLogRepository.create({
            userId,
            userEmail,
            action,
            resource,
            resourceId,
            ipAddress,
            userAgent,
            changes: req.body ? { payload: req.body } : null,
          }).catch(err => console.error('[AuditLog Error]', err.message));
        } catch (err) {
          console.error('[AuditLog Middleware Error]', err.message);
        }
      }

      return res.send(body);
    };

    next();
  };
};

module.exports = { logAudit };
