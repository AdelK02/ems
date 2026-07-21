const Attendance = require('../models/Attendance');

class AttendanceRepository {
  async findAll({ employeeId, status, startDate, endDate, page = 1, limit = 10 }) {
    const query = {};

    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Attendance.find(query)
        .populate('employeeId', 'firstName lastName employeeCode department designation')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attendance.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markAttendance(attendanceData) {
    const { employeeId, date } = attendanceData;
    return Attendance.findOneAndUpdate(
      { employeeId, date: new Date(date) },
      attendanceData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

module.exports = new AttendanceRepository();
