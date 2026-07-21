const Employee = require('../models/Employee');

class EmployeeRepository {
  async findAll({ search, department, status, page = 1, limit = 10 }) {
    const query = {};

    if (status) {
      query.status = status;
    }

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Employee.find(query)
        .populate('managerId', 'firstName lastName email employeeCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Employee.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id) {
    return Employee.findById(id).populate('managerId', 'firstName lastName email employeeCode');
  }

  async findByEmail(email) {
    return Employee.findOne({ email: email.toLowerCase() });
  }

  async findByCode(code) {
    return Employee.findOne({ employeeCode: code.toUpperCase() });
  }

  async create(employeeData) {
    const employee = new Employee(employeeData);
    return employee.save();
  }

  async update(id, employeeData) {
    return Employee.findByIdAndUpdate(id, employeeData, { new: true, runValidators: true });
  }

  async delete(id) {
    return Employee.findByIdAndDelete(id);
  }

  async exportAll() {
    return Employee.find().sort({ createdAt: -1 }).lean();
  }

  async countTotal() {
    return Employee.countDocuments();
  }
}

module.exports = new EmployeeRepository();
