const attendanceRepository = require('../repositories/attendance.repository');

class AttendanceService {
  async getAttendance(params) {
    return attendanceRepository.findAll(params);
  }

  async markAttendance(data) {
    if (!data.employeeId || !data.date) {
      throw new Error('Employee ID and Date are required');
    }
    return attendanceRepository.markAttendance(data);
  }
}

module.exports = new AttendanceService();
