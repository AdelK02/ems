'use client';

import React, { useState, useEffect } from 'react';
import { attendanceService } from '@/services/attendanceService';
import { Attendance } from '@/types';
import toast from 'react-hot-toast';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      try {
        const res = await attendanceService.getAttendance({ status: statusFilter, page: 1, limit: 20 });
        if (res.success && res.data?.data) {
          setAttendance(res.data.data);
        }
      } catch (err: any) {
        toast.error('Failed to load attendance records');
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Attendance Tracking</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time check-in logs and attendance statuses</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="LATE">Late</option>
          <option value="HALF_DAY">Half Day</option>
        </select>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Loading attendance records...
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendance.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-semibold text-white">
                      {rec.employeeId?.firstName || 'Staff'} {rec.employeeId?.lastName || 'Member'}
                      <p className="text-xs text-slate-400 font-mono">{rec.employeeId?.employeeCode}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {new Date(rec.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-emerald-400">
                      {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : '--:--'}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : '--:--'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      {rec.workDurationMinutes ? `${Math.floor(rec.workDurationMinutes / 60)}h ${rec.workDurationMinutes % 60}m` : '0h'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          rec.status === 'PRESENT'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : rec.status === 'LATE'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {rec.status === 'PRESENT' ? <FiCheckCircle /> : <FiAlertCircle />}
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
