const userService = require('../services/user.service');
const ApiResponse = require('../utils/apiResponse');

class UserController {
  async getUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const search = req.query.search || '';

      const result = await userService.getUsers({ page, limit, search });
      return ApiResponse.success(res, 'Users retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      return ApiResponse.success(res, 'User created successfully', user, 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async toggleActive(req, res, next) {
    try {
      const { isActive } = req.body;
      const user = await userService.toggleActiveStatus(req.params.id, isActive);
      return ApiResponse.success(res, 'User status updated', user);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new UserController();
