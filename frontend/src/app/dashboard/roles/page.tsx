'use client';

import React, { useState, useEffect } from 'react';
import { roleService } from '@/services/roleService';
import { Role } from '@/types';
import toast from 'react-hot-toast';
import { FiShield, FiLock, FiCheck } from 'react-icons/fi';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await roleService.getRoles();
        if (res.success && res.data) {
          setRoles(res.data);
        }
      } catch (err: any) {
        toast.error('Failed to load system roles');
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Role-Based Access Control (RBAC)</h1>
        <p className="text-sm text-slate-400 mt-1">Granular permission matrices for organizational access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400">Loading roles...</div>
        ) : (
          roles.map((role) => (
            <div key={role._id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                  {role.name}
                </span>
                {role.isSystemRole && (
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                    <FiLock /> System
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-white text-lg">{role.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{role.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Granted Permissions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex items-center text-[11px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded-md border border-slate-800"
                    >
                      <FiCheck className="text-emerald-400 mr-1" />
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
