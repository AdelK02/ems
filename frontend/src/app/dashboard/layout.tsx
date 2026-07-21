'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FiUsers,
  FiClock,
  FiCalendar,
  FiShield,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiUser,
  FiActivity,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: FiGrid, permission: null },
  { label: 'Employees', href: '/dashboard/employees', icon: FiUsers, permission: 'employees:read' },
  { label: 'Attendance', href: '/dashboard/attendance', icon: FiClock, permission: 'attendance:read' },
  { label: 'Leaves', href: '/dashboard/leaves', icon: FiCalendar, permission: 'leaves:read' },
  { label: 'User Accounts', href: '/dashboard/users', icon: FiUser, permission: 'auditlogs:read' },
  { label: 'Roles & Permissions', href: '/dashboard/roles', icon: FiShield, permission: 'auditlogs:read' },
  { label: 'Audit Logs', href: '/dashboard/audit-logs', icon: FiFileText, permission: 'auditlogs:read' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasPermission } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    router.push('/auth/login');
  };

  const visibleNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <div className="min-h-screen flex bg-[#090d16] text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 glass-nav flex flex-col border-r border-slate-800/80 sticky top-0 h-screen z-20">
        <div className="p-6 border-b border-slate-800/60 flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
            <FiShield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white leading-tight">Enterprise EMS</h1>
            <p className="text-xs text-slate-400">Scale: 10,000+ Users</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 glass-nav sticky top-0 z-10 flex items-center justify-between px-8 border-b border-slate-800/80">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <FiActivity className="w-4 h-4 animate-pulse" />
            <span>API Gateway: Online</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.email || 'admin@enterprise.com'}</p>
              <div className="flex justify-end space-x-1 mt-0.5">
                {(user?.roles || ['ADMIN']).map((r) => {
                  const roleName = typeof r === 'string' ? r : r.name;
                  const roleKey = typeof r === 'string' ? r : r._id || r.name;
                  return (
                    <span
                      key={roleKey}
                      className="text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded"
                    >
                      {roleName}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <FiUser className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
