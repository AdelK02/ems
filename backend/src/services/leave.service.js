const leaveRepository = require('../repositories/leave.repository');

class LeaveService {
  async getLeaves(params) {
    return leaveRepository.findAll(params);
  }

  async applyLeave(data) {
    const { startDate, endDate } = data;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    data.totalDays = diffDays;
    return leaveRepository.create(data);
  }

  async updateLeaveStatus(id, status, adminUserId) {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new Error('Invalid leave status');
    }
    return leaveRepository.updateStatus(id, status, adminUserId);
  }
}

module.exports = new LeaveService();
