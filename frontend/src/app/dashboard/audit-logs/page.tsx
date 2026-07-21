'use client';

import React, { useState, useEffect } from 'react';
import { auditLogService } from '@/services/auditLogService';
import { AuditLog } from '@/types';
import toast from 'react-hot-toast';
import { FiFileText, FiActivity } from 'react-icons/fi';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await auditLogService.getAuditLogs({ page: 1, limit: 30 });
        if (res.success && res.data?.data) {
          setLogs(res.data.data);
        }
      } catch (err: any) {
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Security Audit Logs</h1>
        <p className="text-sm text-slate-400 mt-1">Immutable security event trails (1-Year TTL retention)</p>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full font-mono ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.action === 'UPDATE'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : log.action === 'DELETE'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 text-xs text-indigo-300">
                      {log.userEmail || 'System'}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
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
