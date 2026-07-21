const Leave = require('../models/Leave');

class LeaveRepository {
  async findAll({ employeeId, status, page = 1, limit = 10 }) {
    const query = {};
    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Leave.find(query)
        .populate('employeeId', 'firstName lastName employeeCode department designation')
        .populate('approvedBy', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Leave.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(leaveData) {
    const leave = new Leave(leaveData);
    return leave.save();
  }

  async updateStatus(id, status, approvedBy) {
    return Leave.findByIdAndUpdate(
      id,
      { status, approvedBy },
      { new: true }
    );
  }
}

module.exports = new LeaveRepository();
