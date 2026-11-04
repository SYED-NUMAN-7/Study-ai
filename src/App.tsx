import React, { useState, useEffect } from 'react';
import type { User, QuestionRecord, StudyPack, StudyPackSummaryItem } from './types/index.js';
import { api, authStorage } from './lib/api.js';
import { Navbar } from './components/Navbar.js';
import { AuthView } from './components/AuthView.js';
import { ClassSelectorModal } from './components/ClassSelectorModal.js';
import { AskAIView } from './components/AskAIView.js';
import { CreateStudyPackView } from './components/CreateStudyPackView.js';
import { StudyPackDetailView } from './components/StudyPackDetailView.js';
import { StudyPacksListView } from './components/StudyPacksListView.js';
import { HistoryView } from './components/HistoryView.js';
import { SettingsView } from './components/SettingsView.js';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'ask' | 'create-pack' | 'packs' | 'history' | 'settings' | 'view-pack'>('ask');

  const [classSelectorOpen, setClassSelectorOpen] = useState(false);
  const [isUpdatingClass, setIsUpdatingClass] = useState(false);

  // User-scoped data
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [studyPacks, setStudyPacks] = useState<StudyPackSummaryItem[]>([]);
  const [activePack, setActivePack] = useState<StudyPack | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Initial load
  useEffect(() => {
    async function initUser() {
      try {
        const currentUser = await api.getMe();
        if (currentUser) {
          setUser(currentUser);
          await loadUserData();
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      } finally {
        setAuthLoading(false);
      }
    }
    initUser();
  }, []);

  const loadUserData = async () => {
    try {
      const [fetchedQuestions, fetchedPacks] = await Promise.all([
        api.getQuestionHistory(),
        api.getStudyPacks(),
      ]);
      setQuestions(fetchedQuestions);
      setStudyPacks(fetchedPacks);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Auth Handlers
  const handleLogin = async (data: { email: string; password: string }) => {
    const res = await api.login(data);
    setUser(res.user);
    await loadUserData();
    setCurrentTab('ask');
    showNotification(`Welcome back, ${res.user.name}!`);
    return res;
  };

  const handleRegister = async (data: { name: string; email: string; password: string; selected_class: number }) => {
    const res = await api.register(data);
    setUser(res.user);
    await loadUserData();
    setCurrentTab('ask');
    showNotification(`Welcome to StudyPack AI, ${res.user.name}!`);
    return res;
  };

  const handleQuickLogin = async (email: string) => {
    const res = await api.login({ email, password: 'password123' });
    setUser(res.user);
    await loadUserData();
    setCurrentTab('ask');
    showNotification(`Logged in as ${res.user.name} (Class ${res.user.selected_class})`);
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setQuestions([]);
    setStudyPacks([]);
    setActivePack(null);
    setCurrentTab('ask');
    showNotification('Logged out successfully.');
  };

  // Quick switch between the two pre-seeded accounts to demonstrate strict data separation
  const handleQuickSwitch = async () => {
    if (!user) return;
    const targetEmail = user.email === 'aarav@example.com' ? 'priya@example.com' : 'aarav@example.com';
    await handleQuickLogin(targetEmail);
  };

  // Class update
  const handleSelectClass = async (classNum: number) => {
    if (!user) return;
    setIsUpdatingClass(true);
    try {
      const res = await api.updateClass(classNum);
      setUser({ ...user, selected_class: res.selected_class });
      setClassSelectorOpen(false);
      showNotification(res.message);
    } catch (err: any) {
      showNotification(err.message || 'Failed to update class');
    } finally {
      setIsUpdatingClass(false);
    }
  };

  // Profile update
  const handleUpdateProfile = async (name: string) => {
    if (!user) return;
    const res = await api.updateProfile(name);
    setUser({ ...user, name: res.name });
    showNotification('Profile updated successfully');
  };

  // Ask AI handler
  const handleAskQuestion = async (question: string, subject?: string) => {
    const newRecord = await api.askQuestion({ question, subject });
    setQuestions((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const handleDeleteQuestion = async (id: string) => {
    await api.deleteQuestion(id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    showNotification('Question removed from history.');
  };

  // Study Pack handlers
  const handleGenerateStudyPack = async (payload: {
    userPromptTitle?: string;
    textContent?: string;
    fileBufferBase64?: string;
    mimeType?: string;
    fileName?: string;
    fileType?: string;
  }) => {
    const pack = await api.generateStudyPack(payload);
    setActivePack(pack);
    setCurrentTab('view-pack');
    showNotification('Study pack generated successfully!');
    // Refresh list
    const updated = await api.getStudyPacks();
    setStudyPacks(updated);
    return pack;
  };

  const handleOpenPack = async (id: string) => {
    try {
      const fullPack = await api.getStudyPackById(id);
      setActivePack(fullPack);
      setCurrentTab('view-pack');
    } catch (err: any) {
      showNotification(err.message || 'Could not load study pack');
    }
  };

  const handleDeletePack = async (id: string) => {
    try {
      await api.deleteStudyPack(id);
      setStudyPacks((prev) => prev.filter((p) => p.id !== id));
      if (activePack?.id === id) {
        setActivePack(null);
        setCurrentTab('packs');
      }
      showNotification('Study pack deleted.');
    } catch (err: any) {
      showNotification(err.message || 'Could not delete study pack');
    }
  };

  // Global loading state while checking session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Loading StudyPack AI...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Authentication View
  if (!user) {
    return (
      <AuthView
        onLogin={handleLogin}
        onRegister={handleRegister}
        onQuickLogin={handleQuickLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 md:pb-8 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          {notification}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={user}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setActivePack(null);
          setCurrentTab(tab);
        }}
        onOpenClassSelector={() => setClassSelectorOpen(true)}
        onLogout={handleLogout}
        onQuickSwitchUser={handleQuickSwitch}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'ask' && (
          <AskAIView
            user={user}
            onAskQuestion={handleAskQuestion}
            recentQuestions={questions}
            onDeleteQuestion={handleDeleteQuestion}
            onOpenClassSelector={() => setClassSelectorOpen(true)}
          />
        )}

        {currentTab === 'create-pack' && (
          <CreateStudyPackView
            user={user}
            onGenerateStudyPack={handleGenerateStudyPack}
            onStudyPackCreated={(pack) => {
              setActivePack(pack);
              setCurrentTab('view-pack');
            }}
            onOpenClassSelector={() => setClassSelectorOpen(true)}
          />
        )}

        {currentTab === 'view-pack' && activePack && (
          <StudyPackDetailView
            pack={activePack}
            onBack={() => setCurrentTab('packs')}
            onDelete={handleDeletePack}
          />
        )}

        {currentTab === 'packs' && (
          <StudyPacksListView
            user={user}
            packs={studyPacks}
            onOpenPack={handleOpenPack}
            onCreateNew={() => setCurrentTab('create-pack')}
            onDeletePack={handleDeletePack}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            user={user}
            questions={questions}
            onDeleteQuestion={handleDeleteQuestion}
            onAskAgain={(q) => {
              setCurrentTab('ask');
            }}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onUpdateClass={handleSelectClass}
            onOpenClassSelector={() => setClassSelectorOpen(true)}
            onLogout={handleLogout}
            onSwitchToTestAccount={handleQuickLogin}
          />
        )}
      </main>

      {/* Class Selector Modal */}
      <ClassSelectorModal
        isOpen={classSelectorOpen}
        onClose={() => setClassSelectorOpen(false)}
        currentClass={user.selected_class}
        onSelectClass={handleSelectClass}
        isUpdating={isUpdatingClass}
      />
    </div>
  );
}
