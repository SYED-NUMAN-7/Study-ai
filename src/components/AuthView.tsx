import React, { useState } from 'react';
import type { User } from '../types/index.js';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface AuthViewProps {
  onLogin: (data: { email: string; password: string }) => Promise<{ token: string; user: User }>;
  onRegister: (data: { name: string; email: string; password: string; selected_class: number }) => Promise<{ token: string; user: User }>;
  onQuickLogin: (email: string) => Promise<void>;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
  onRegister,
  onQuickLogin,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedClass, setSelectedClass] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await onLogin({ email: email.trim(), password });
      } else {
        if (!name.trim()) throw new Error('Please enter your full name');
        await onRegister({
          name: name.trim(),
          email: email.trim(),
          password,
          selected_class: selectedClass,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAccountClick = async (testEmail: string) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await onQuickLogin(testEmail);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to log in with test account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo and Brand */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-md mb-3">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            StudyPack
          </h1>
          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold">
            AI
          </span>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xs mx-auto">
          Personalized learning companion for students from Class 1 to Class 10
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 sm:px-8 shadow-sm rounded-3xl border border-slate-200 space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Student Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Student Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>
            </div>

            {/* Class Selection during Register */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Select Your Class (1 to 10)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedClass(c)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        selectedClass === c
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      Class {c}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  You can change your class anytime in Settings.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-sm mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to StudyPack' : 'Create My Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts for Instant Data-Separation Verification */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verify Privacy & Data Separation (1-Click Test):</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Test with two separate pre-configured student accounts to confirm complete data isolation:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTestAccountClick('aarav@example.com')}
                disabled={loading}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 group-hover:text-amber-950">Aarav Sharma</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold text-[10px]">Class 4</span>
                </div>
                <p className="text-[10px] text-amber-700 mt-0.5">Elementary: Solar System & Fractions</p>
              </button>

              <button
                type="button"
                onClick={() => handleTestAccountClick('priya@example.com')}
                disabled={loading}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900 group-hover:text-emerald-950">Priya Patel</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-bold text-[10px]">Class 9</span>
                </div>
                <p className="text-[10px] text-emerald-700 mt-0.5">High School: Cell Biology & Equations</p>
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Strict per-user data protection enforced in backend database</span>
          </div>
        </div>
      </div>
    </div>
  );
};
