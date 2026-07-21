const Role = require('../models/Role');

class RoleRepository {
  async findAll() {
    return Role.find().lean();
  }

  async findByName(name) {
    return Role.findOne({ name: name.toUpperCase() });
  }

  async findById(id) {
    return Role.findById(id);
  }

  async create(roleData) {
    const role = new Role(roleData);
    return role.save();
  }

  async update(id, roleData) {
    return Role.findByIdAndUpdate(id, roleData, { new: true });
  }
}

module.exports = new RoleRepository();
