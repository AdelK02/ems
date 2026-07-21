const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Role = require('./models/Role');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const AuditLog = require('./models/AuditLog');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ems_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      Employee.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing data');

    // 1. Create System Roles
    const adminRole = await Role.create({
      name: 'ADMIN',
      description: 'System Super Administrator',
      permissions: ['*'],
      isSystemRole: true,
    });

    const hrRole = await Role.create({
      name: 'HR_MANAGER',
      description: 'Human Resources Manager',
      permissions: [
        'employees:read',
        'employees:create',
        'employees:update',
        'employees:delete',
        'attendance:read',
        'attendance:mark',
        'leaves:read',
        'leaves:approve',
        'auditlogs:read',
      ],
      isSystemRole: true,
    });

    const employeeRole = await Role.create({
      name: 'EMPLOYEE',
      description: 'Standard Organization Employee',
      permissions: ['employees:read', 'attendance:read', 'leaves:read', 'leaves:apply'],
      isSystemRole: true,
    });

    console.log('[Seed] Created default roles (ADMIN, HR_MANAGER, EMPLOYEE)');

    // 2. Create Admin Employee & User
    const adminEmployee = await Employee.create({
      employeeCode: 'EMP-10001',
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@enterprise.com',
      phone: '+1 555-0199',
      department: 'Executive',
      designation: 'Chief Technology Officer',
      joiningDate: new Date('2022-01-01'),
      salary: 180000,
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    const adminPasswordHash = await bcrypt.hash('Admin@123', 12);
    const adminUser = await User.create({
      email: 'admin@enterprise.com',
      passwordHash: adminPasswordHash,
      employeeId: adminEmployee._id,
      roles: [adminRole._id],
      isActive: true,
    });

    // HR Manager User
    const hrEmployee = await Employee.create({
      employeeCode: 'EMP-10002',
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'hr@enterprise.com',
      phone: '+1 555-0200',
      department: 'Human Resources',
      designation: 'HR Lead Specialist',
      joiningDate: new Date('2023-03-15'),
      salary: 110000,
      status: 'ACTIVE',
      avatarUrl: 'https://i.pravatar.cc/150?u=EMP-10002',
    });

    const hrPasswordHash = await bcrypt.hash('Hr@12345', 12);
    await User.create({
      email: 'hr@enterprise.com',
      passwordHash: hrPasswordHash,
      employeeId: hrEmployee._id,
      roles: [hrRole._id],
      isActive: true,
    });

    // Standard Staff User
    const staffEmployee = await Employee.create({
      employeeCode: 'EMP-10003',
      firstName: 'John',
      lastName: 'Doe',
      email: 'staff@enterprise.com',
      phone: '+1 555-0300',
      department: 'Engineering',
      designation: 'Software Engineer',
      joiningDate: new Date('2024-01-10'),
      salary: 85000,
      status: 'ACTIVE',
      avatarUrl: 'https://i.pravatar.cc/150?u=EMP-10003',
    });

    const staffPasswordHash = await bcrypt.hash('Staff@123', 12);
    await User.create({
      email: 'staff@enterprise.com',
      passwordHash: staffPasswordHash,
      employeeId: staffEmployee._id,
      roles: [employeeRole._id],
      isActive: true,
    });

    console.log('[Seed] Created Admin (admin@enterprise.com / Admin@123)');
    console.log('[Seed] Created HR Manager (hr@enterprise.com / Hr@12345)');
    console.log('[Seed] Created Standard Employee (staff@enterprise.com / Staff@123)');

    // 3. Create 50 Sample Employees
    const departments = ['Engineering', 'Human Resources', 'Finance', 'Sales', 'Operations', 'Marketing'];
    const designations = {
      Engineering: ['Senior Software Engineer', 'Frontend Lead', 'DevOps Architect', 'QA Engineer', 'Fullstack Developer'],
      'Human Resources': ['HR Specialist', 'Talent Lead', 'People Operations Specialist'],
      Finance: ['Senior Financial Analyst', 'Accountant', 'Payroll Lead'],
      Sales: ['Enterprise Account Executive', 'Business Development Rep', 'Regional Sales Manager'],
      Operations: ['Operations Director', 'Supply Chain Specialist', 'Procurement Officer'],
      Marketing: ['Growth Marketer', 'Content Manager', 'Brand Designer'],
    };

    const sampleEmployees = [];
    for (let i = 4; i <= 53; i++) {
      const dept = departments[i % departments.length];
      const deptDesigs = designations[dept];
      const desig = deptDesigs[i % deptDesigs.length];

      sampleEmployees.push({
        employeeCode: `EMP-${10000 + i}`,
        firstName: `Employee_${i}`,
        lastName: `Staff`,
        email: `employee${i}@enterprise.com`,
        phone: `+1 555-01${10 + (i % 80)}`,
        department: dept,
        designation: desig,
        joiningDate: new Date(Date.now() - (i * 10 + 30) * 24 * 60 * 60 * 1000),
        salary: 60000 + (i * 1200),
        status: i % 7 === 0 ? 'ON_LEAVE' : 'ACTIVE',
        avatarUrl: `https://i.pravatar.cc/150?u=EMP-${10000 + i}`,
        managerId: adminEmployee._id,
      });
    }

    const createdEmployees = await Employee.insertMany(sampleEmployees);
    console.log(`[Seed] Created ${createdEmployees.length} sample employees`);

    // Create corresponding User accounts for all sample employees
    const userPasswordHash = await bcrypt.hash('User@123', 12);
    const sampleUsers = createdEmployees.map((emp) => ({
      email: emp.email,
      passwordHash: userPasswordHash,
      employeeId: emp._id,
      roles: [employeeRole._id],
      isActive: true,
    }));

    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`[Seed] Created ${createdUsers.length + 3} total User accounts`);

    // 4. Create Sample Attendance & Leave Records
    const attendanceRecords = [];
    const leaveRecords = [];

    for (const emp of createdEmployees.slice(0, 10)) {
      attendanceRecords.push({
        employeeId: emp._id,
        date: new Date('2026-07-20'),
        checkIn: new Date('2026-07-20T09:00:00Z'),
        checkOut: new Date('2026-07-20T17:30:00Z'),
        status: 'PRESENT',
        workDurationMinutes: 510,
        remarks: 'On time',
      });

      leaveRecords.push({
        employeeId: emp._id,
        leaveType: 'CASUAL',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-03'),
        totalDays: 3,
        reason: 'Annual family event',
        status: 'PENDING',
      });
    }

    await Attendance.insertMany(attendanceRecords);
    await Leave.insertMany(leaveRecords);

    // Initial Audit Log
    await AuditLog.create({
      userId: adminUser._id,
      userEmail: adminUser.email,
      action: 'CREATE',
      resource: 'SYSTEM',
      ipAddress: '127.0.0.1',
      changes: { message: 'Database initial seeding completed' },
    });

    console.log('[Seed] Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
