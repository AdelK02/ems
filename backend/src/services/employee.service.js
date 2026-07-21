const employeeRepository = require('../repositories/employee.repository');
const userRepository = require('../repositories/user.repository');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const { convertToCSV } = require('../utils/csv.util');

class EmployeeService {
  async getEmployees(params) {
    return employeeRepository.findAll(params);
  }

  async getEmployeeById(id) {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employee;
  }

  async createEmployee(employeeData) {
    const existingEmail = await employeeRepository.findByEmail(employeeData.email);
    if (existingEmail) {
      throw new Error('Employee with this email already exists');
    }

    if (employeeData.employeeCode) {
      const existingCode = await employeeRepository.findByCode(employeeData.employeeCode);
      if (existingCode) {
        throw new Error('Employee with this code already exists');
      }
    } else {
      const count = await employeeRepository.countTotal();
      employeeData.employeeCode = `EMP-${10000 + count + 1}`;
    }

    const employee = await employeeRepository.create(employeeData);

    // If createLoginUser is specified or boolean true, auto-generate login credentials for this employee
    if (employeeData.createLoginUser === 'true' || employeeData.createLoginUser === true || employeeData.password) {
      const plainPassword = employeeData.password || 'User@123';
      const roleName = employeeData.roleName || 'EMPLOYEE';
      const role = await Role.findOne({ name: roleName });

      const passwordHash = await bcrypt.hash(plainPassword, 12);
      await userRepository.create({
        email: employee.email.toLowerCase(),
        passwordHash,
        employeeId: employee._id,
        roles: role ? [role._id] : [],
        isActive: true,
      });
    }

    return employee;
  }

  async updateEmployee(id, employeeData) {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employeeRepository.update(id, employeeData);
  }

  async deleteEmployee(id) {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    return employeeRepository.delete(id);
  }

  async exportEmployeesCSV() {
    const User = require('../models/User');
    const Employee = require('../models/Employee');

    // Sync any user accounts that do not have an employee record linked
    const unlinkedUsers = await User.find({ employeeId: null });
    for (const u of unlinkedUsers) {
      let emp = await Employee.findOne({ email: u.email });
      if (!emp) {
        const count = await Employee.countDocuments();
        const username = u.email.split('@')[0];
        emp = await Employee.create({
          employeeCode: `EMP-${10000 + count + 1}`,
          firstName: username.charAt(0).toUpperCase() + username.slice(1),
          lastName: 'Staff',
          email: u.email,
          department: 'Operations',
          designation: 'Staff Associate',
          joiningDate: new Date(),
          salary: 60000,
          status: 'ACTIVE',
        });
      }
      u.employeeId = emp._id;
      await u.save();
    }

    const employees = await employeeRepository.exportAll();
    return convertToCSV(employees);
  }
}

module.exports = new EmployeeService();
