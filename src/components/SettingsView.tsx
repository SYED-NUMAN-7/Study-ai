import React, { useState } from 'react';
import type { User } from '../types/index.js';
import {
  Settings,
  ShieldCheck,
  UserCheck,
  Save,
  LogOut,
  Sparkles,
  Info,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface SettingsViewProps {
  user: User;
  onUpdateProfile: (name: string) => Promise<void>;
  onUpdateClass: (classNum: number) => Promise<void>;
  onOpenClassSelector: () => void;
  onLogout: () => void;
  onSwitchToTestAccount?: (email: string) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateProfile,
  onUpdateClass,
  onOpenClassSelector,
  onLogout,
  onSwitchToTestAccount,
}) => {
  const [nameInput, setNameInput] = useState(user.name);
  const [savingName, setSavingName] = useState(false);
  const [nameSavedMsg, setNameSavedMsg] = useState(false);
  const [classSaving, setClassSaving] = useState(false);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setSavingName(true);
    setNameSavedMsg(false);
    try {
      await onUpdateProfile(nameInput.trim());
      setNameSavedMsg(true);
      setTimeout(() => setNameSavedMsg(false), 3000);
    } finally {
      setSavingName(false);
    }
  };

  const handleSelectClass = async (c: number) => {
    setClassSaving(true);
    try {
      await onUpdateClass(c);
    } finally {
      setClassSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Account & Learning Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your student profile, grade level calibration, and privacy settings.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <span>Student Information</span>
        </h2>

        <form onSubmit={handleSaveName} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Student Full Name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Registered Email (Login ID)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Each student has an isolated private account.
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={savingName || nameInput.trim() === user.name}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{savingName ? 'Saving...' : 'Update Name'}</span>
            </button>

            {nameSavedMsg && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Name updated!</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Class Level Settings */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Current Class Level</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your class to adjust the difficulty, vocabulary, and depth of all answers.
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
            Currently in Class {user.selected_class}
          </span>
        </div>

        {/* 10 Class Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => {
            const isSelected = user.selected_class === c;
            return (
              <button
                key={c}
                type="button"
                disabled={classSaving}
                onClick={() => handleSelectClass(c)}
                className={`py-3 px-3 rounded-xl text-center border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:border-indigo-400 text-slate-800 font-semibold'
                }`}
              >
                <div className="text-sm">Class {c}</div>
                <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {c <= 3 ? 'Ages 6-8' : c <= 5 ? 'Ages 9-10' : c <= 8 ? 'Ages 11-13' : 'Ages 14-16'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">How difficulty changes for Class {user.selected_class}:</p>
          {user.selected_class <= 3 && (
            <p>• Class 1–3: Uses very simple words, short sentences, and everyday examples like toys, animals, and play.</p>
          )}
          {user.selected_class >= 4 && user.selected_class <= 5 && (
            <p>• Class 4–5: Uses simple school-level explanations with relatable classroom and kitchen examples.</p>
          )}
          {user.selected_class >= 6 && user.selected_class <= 8 && (
            <p>• Class 6–8: Clear explanations with moderate detail, introducing core subject terms and formulas.</p>
          )}
          {user.selected_class >= 9 && (
            <p>• Class 9–10: Detailed school-level explanations with full academic rigor, formulas, and exam precision.</p>
          )}
        </div>
      </div>

      {/* Privacy & Complete Data Isolation Verification Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-emerald-200 space-y-4">
        <div className="flex items-center gap-2 text-emerald-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold">Privacy & Data Isolation Verification</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Every student account on StudyPack AI is completely isolated. All database queries for study packs, uploaded files, and Ask AI questions strictly enforce authorization using <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs">WHERE user_id = ?</code> in the backend. No student can ever view, search, or access another student's data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
            <span className="font-semibold text-emerald-900 block">Your Account ID:</span>
            <span className="font-mono text-emerald-700 text-[11px] truncate block mt-0.5">{user.id}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
            <span className="font-semibold text-emerald-900 block">Backend Enforcement:</span>
            <span className="text-emerald-700 text-[11px] block mt-0.5">Strict Foreign Keys & Session Validation</span>
          </div>
        </div>

        {/* Quick Test Switcher to verify separation with 2 accounts */}
        {onSwitchToTestAccount && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-700 mb-2">
              Test Data Separation (Switch between 2 student accounts with 1 click):
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSwitchToTestAccount('aarav@example.com')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  user.email === 'aarav@example.com'
                    ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Switch to Aarav (Class 4)</span>
                {user.email === 'aarav@example.com' && <span className="text-[10px] text-amber-700">(Active)</span>}
              </button>

              <button
                type="button"
                onClick={() => onSwitchToTestAccount('priya@example.com')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  user.email === 'priya@example.com'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Switch to Priya (Class 9)</span>
                {user.email === 'priya@example.com' && <span className="text-[10px] text-emerald-700">(Active)</span>}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Notice that switching accounts immediately swaps the library: Aarav sees ONLY Aarav's Solar System pack, and Priya sees ONLY Priya's Cell Biology pack!
            </p>
          </div>
        )}
      </div>

      {/* Logout Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Log out of StudyPack AI</h3>
          <p className="text-xs text-slate-500 mt-0.5">End your current session safely.</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs sm:text-sm border border-rose-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
