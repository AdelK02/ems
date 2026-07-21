const roleRepository = require('../repositories/role.repository');

class RoleService {
  async getRoles() {
    return roleRepository.findAll();
  }

  async createRole(roleData) {
    const existing = await roleRepository.findByName(roleData.name);
    if (existing) {
      throw new Error('Role name already exists');
    }
    return roleRepository.create(roleData);
  }

  async updateRole(id, roleData) {
    return roleRepository.update(id, roleData);
  }
}

module.exports = new RoleService();
