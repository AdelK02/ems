const AuditLog = require('../models/AuditLog');

class AuditLogRepository {
  async create(logData) {
    const log = new AuditLog(logData);
    return log.save();
  }

  async findAll({ page = 1, limit = 20, action, resource }) {
    const query = {};
    if (action) query.action = action;
    if (resource) query.resource = resource;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new AuditLogRepository();
