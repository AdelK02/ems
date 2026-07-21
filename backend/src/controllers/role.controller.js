const roleService = require('../services/role.service');
const ApiResponse = require('../utils/apiResponse');

class RoleController {
  async getRoles(req, res, next) {
    try {
      const roles = await roleService.getRoles();
      return ApiResponse.success(res, 'Roles retrieved', roles);
    } catch (error) {
      next(error);
    }
  }

  async createRole(req, res, next) {
    try {
      const role = await roleService.createRole(req.body);
      return ApiResponse.success(res, 'Role created successfully', role, 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async updateRole(req, res, next) {
    try {
      const role = await roleService.updateRole(req.params.id, req.body);
      return ApiResponse.success(res, 'Role updated successfully', role);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new RoleController();
