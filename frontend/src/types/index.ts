export interface User {
  id?: string;
  _id?: string;
  email: string;
  roles: (string | Role)[];
  permissions?: string[];
  employeeId?: Partial<Employee> | string;
  isActive?: boolean;
  lastLogin?: string;
}

export interface Employee {
  _id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  joiningDate: string;
  salary: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  avatarUrl?: string;
  createdAt?: string;
}

export interface Attendance {
  _id: string;
  employeeId: Partial<Employee>;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  workDurationMinutes: number;
  remarks?: string;
}

export interface Leave {
  _id: string;
  employeeId: Partial<Employee>;
  leaveType: 'SICK' | 'CASUAL' | 'ANNUAL' | 'MATERNITY';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: { email: string };
  createdAt?: string;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
}

export interface AuditLog {
  _id: string;
  userId?: { email: string };
  userEmail?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT_CSV';
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  changes?: Record<string, any>;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
