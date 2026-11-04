import React, { useState } from 'react';
import type { User } from '../types/index.js';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  HelpCircle,
  FolderKanban,
  History,
  Settings,
  LogOut,
  ChevronDown,
  UserCheck,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  user: User;
  currentTab: 'ask' | 'create-pack' | 'packs' | 'history' | 'settings' | 'view-pack';
  onSelectTab: (tab: 'ask' | 'create-pack' | 'packs' | 'history' | 'settings') => void;
  onOpenClassSelector: () => void;
  onLogout: () => void;
  onQuickSwitchUser?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentTab,
  onSelectTab,
  onOpenClassSelector,
  onLogout,
  onQuickSwitchUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'ask', label: 'Ask AI', icon: HelpCircle },
    { id: 'create-pack', label: 'New Study Pack', icon: BookOpen },
    { id: 'packs', label: 'My Packs', icon: FolderKanban },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectTab('ask')}
                className="flex items-center gap-2.5 text-left focus-visible:outline-indigo-600 rounded-lg p-1"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-slate-900 tracking-tight">StudyPack</span>
                    <span className="font-extrabold text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono tracking-wider">AI</span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block">Class 1 to 10 Learning Companion</p>
                </div>
              </button>

              {/* Class Level Selector Button */}
              <button
                type="button"
                onClick={onOpenClassSelector}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200/80 cursor-pointer"
                title="Change student class level"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Class {user.selected_class}</span>
                <ChevronDown className="w-3 h-3 text-indigo-500" />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Account Switch Helper for testing privacy */}
              {onQuickSwitchUser && (
                <button
                  type="button"
                  onClick={onQuickSwitchUser}
                  className="hidden lg:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                  title="Switch to second test student to verify complete data isolation"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Switch Test Student</span>
                </button>
              )}

              {/* User Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <p className="font-semibold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-slate-500 text-[10px]">Class {user.selected_class}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Private data isolated</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onOpenClassSelector();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                      >
                        <span>Change Class Level</span>
                        <span className="font-semibold text-indigo-600">Class {user.selected_class}</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectTab('settings');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Account & Privacy Settings</span>
                      </button>

                      {onQuickSwitchUser && (
                        <button
                          onClick={() => {
                            onQuickSwitchUser();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Switch to 2nd Test Account</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu hamburger toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-left ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            {onQuickSwitchUser && (
              <button
                onClick={() => {
                  onQuickSwitchUser();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors text-left"
              >
                <UserCheck className="w-4 h-4" />
                <span>Switch to 2nd Test Student</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Mobile-first Bottom Bar for Easy One-Thumb Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[11px] font-medium transition-colors ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
