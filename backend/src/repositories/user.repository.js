const User = require('../models/User');

class UserRepository {
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() }).populate('roles');
  }

  async findById(id) {
    return User.findById(id).populate('roles').populate('employeeId');
  }

  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async updateLastLogin(id) {
    return User.findByIdAndUpdate(id, {
      lastLogin: new Date(),
      failedLoginAttempts: 0,
      lockUntil: null,
    });
  }

  async incrementFailedLogin(id) {
    return User.findByIdAndUpdate(id, { $inc: { failedLoginAttempts: 1 } });
  }

  async findAll() {
    return User.find().populate('roles').populate('employeeId').select('-passwordHash').lean();
  }
}

module.exports = new UserRepository();
