const attendanceService = require('../services/attendance.service');
const ApiResponse = require('../utils/apiResponse');

class AttendanceController {
  async getAttendance(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const { employeeId, status, startDate, endDate } = req.query;

      const result = await attendanceService.getAttendance({
        page,
        limit,
        employeeId,
        status,
        startDate,
        endDate,
      });

      return ApiResponse.success(res, 'Attendance records retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  async markAttendance(req, res, next) {
    try {
      const record = await attendanceService.markAttendance(req.body);
      return ApiResponse.success(res, 'Attendance marked successfully', record);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new AttendanceController();
