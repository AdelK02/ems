const User = require('../models/User');
const Role = require('../models/Role');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

class UserService {
  async getUsers({ page = 1, limit = 10, search = '' }) {
    const query = {};
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      User.find(query)
        .populate('roles')
        .populate('employeeId')
        .select('-passwordHash')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createUser({ email, password, roleNames = ['EMPLOYEE'], employeeId }) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new Error('User with this email already exists');
    }

    let linkedEmployeeId = employeeId;

    // If no employeeId is provided, check or auto-create an Employee record
    if (!linkedEmployeeId) {
      let emp = await Employee.findOne({ email: email.toLowerCase() });
      if (!emp) {
        const count = await Employee.countDocuments();
        const username = email.split('@')[0];
        emp = await Employee.create({
          employeeCode: `EMP-${10000 + count + 1}`,
          firstName: username.charAt(0).toUpperCase() + username.slice(1),
          lastName: 'Staff',
          email: email.toLowerCase(),
          department: 'Operations',
          designation: 'Staff Associate',
          joiningDate: new Date(),
          salary: 60000,
          status: 'ACTIVE',
        });
      }
      linkedEmployeeId = emp._id;
    }

    const roles = await Role.find({ name: { $in: roleNames } });
    const roleIds = roles.map((r) => r._id);
    const passwordHash = await bcrypt.hash(password || 'User@123', 12);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      employeeId: linkedEmployeeId,
      roles: roleIds,
      isActive: true,
    });

    return User.findById(user._id).populate('roles').populate('employeeId').select('-passwordHash');
  }

  async toggleActiveStatus(userId, isActive) {
    return User.findByIdAndUpdate(userId, { isActive }, { new: true })
      .populate('roles')
      .populate('employeeId')
      .select('-passwordHash');
  }
}

module.exports = new UserService();
