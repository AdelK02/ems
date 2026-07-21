const employeeService = require('../services/employee.service');
const ApiResponse = require('../utils/apiResponse');

class EmployeeController {
  async getEmployees(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const search = req.query.search || '';
      const department = req.query.department || '';
      const status = req.query.status || '';

      const result = await employeeService.getEmployees({ page, limit, search, department, status });
      return ApiResponse.success(res, 'Employees retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req, res, next) {
    try {
      const employee = await employeeService.getEmployeeById(req.params.id);
      return ApiResponse.success(res, 'Employee details', employee);
    } catch (error) {
      return ApiResponse.error(res, error.message, 404);
    }
  }

  async createEmployee(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.avatarUrl = `/uploads/${req.file.filename}`;
      }

      const employee = await employeeService.createEmployee(data);
      return ApiResponse.success(res, 'Employee created successfully', employee, 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async updateEmployee(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.avatarUrl = `/uploads/${req.file.filename}`;
      }

      const employee = await employeeService.updateEmployee(req.params.id, data);
      return ApiResponse.success(res, 'Employee updated successfully', employee);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async deleteEmployee(req, res, next) {
    try {
      await employeeService.deleteEmployee(req.params.id);
      return ApiResponse.success(res, 'Employee deleted successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async exportCSV(req, res, next) {
    try {
      const csvData = await employeeService.exportEmployeesCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeeController();
