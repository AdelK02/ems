'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { FiLock, FiMail, FiShield, FiKey } from 'react-icons/fi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const autofillAdmin = () => {
    setEmail('admin@enterprise.com');
    setPassword('Admin@123');
    toast.success('Auto-filled Admin credentials');
  };

  return (
    <div className="w-full max-w-md glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-slate-800">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-xl mb-3 text-indigo-400">
          <FiShield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise EMS Login</h1>
        <p className="text-sm text-slate-400 mt-1">Sign in to your enterprise account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@enterprise.com"
              required
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Sign In to Dashboard</span>
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-800 text-center">
        <button
          type="button"
          onClick={autofillAdmin}
          className="inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 font-medium space-x-1.5 transition-colors"
        >
          <FiKey className="w-4 h-4" />
          <span>Auto-fill Demo Admin Credentials</span>
        </button>
      </div>
    </div>
  );
}
