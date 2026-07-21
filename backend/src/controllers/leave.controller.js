const leaveService = require('../services/leave.service');
const Employee = require('../models/Employee');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

class LeaveController {
  async resolveEmployeeId(user) {
    if (user?.employeeId) return user.employeeId;
    if (user?.email) {
      const emp = await Employee.findOne({ email: user.email.toLowerCase() });
      if (emp) {
        // Link employeeId back to user for future requests
        await User.findByIdAndUpdate(user.userId, { employeeId: emp._id });
        return emp._id.toString();
      }
    }
    return null;
  }

  async getLeaves(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      let { employeeId, status } = req.query;

      const userPermissions = req.user?.permissions || [];
      const userRoles = req.user?.roles || [];
      const canManageLeaves = userPermissions.includes('*') || userPermissions.includes('leaves:approve') || userRoles.includes('ADMIN') || userRoles.includes('HR_MANAGER');

      if (!canManageLeaves) {
        const resolvedEmpId = await new LeaveController().resolveEmployeeId(req.user);
        if (!resolvedEmpId) {
          return ApiResponse.success(res, 'No employee record linked to account', {
            data: [],
            total: 0,
            page: 1,
            totalPages: 0,
          });
        }
        employeeId = resolvedEmpId;
      }

      const result = await leaveService.getLeaves({ page, limit, employeeId, status });
      return ApiResponse.success(res, 'Leaves retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  async applyLeave(req, res, next) {
    try {
      const leaveData = { ...req.body };
      if (!leaveData.employeeId) {
        const resolvedEmpId = await new LeaveController().resolveEmployeeId(req.user);
        if (!resolvedEmpId) {
          return ApiResponse.error(
            res,
            `No employee profile linked to account '${req.user?.email}'. Please contact HR to link your user account to an employee record before applying for leave.`,
            400
          );
        }
        leaveData.employeeId = resolvedEmpId;
      }

      const leave = await leaveService.applyLeave(leaveData);
      return ApiResponse.success(res, 'Leave application submitted', leave, 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async updateLeaveStatus(req, res, next) {
    try {
      const { status } = req.body;
      const adminUserId = req.user ? req.user.userId : null;
      const leave = await leaveService.updateLeaveStatus(req.params.id, status, adminUserId);
      return ApiResponse.success(res, `Leave status updated to ${status}`, leave);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new LeaveController();
