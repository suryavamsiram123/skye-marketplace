import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Sun, Moon, Wallet, Map } from 'lucide-react';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ChatPage } from './components/ChatPage';
import { SettingsPage } from './components/SettingsPage';
import { WalletPage } from './components/WalletPage';
import { BrowseGigsPage } from './components/BrowseGigsPage';
import { useAppState } from './hooks/useAppState';

type Page = 'onboarding' | 'chat' | 'settings' | 'wallet' | 'browse';

const THEME_KEY = 'milo_theme';

function App() {
  const [page, setPage] = useState<Page>('chat');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const {
    userId,
    profile,
    activeGigs,
    matches,
    loading,
    totalEscrow,
    saveProfile,
    addMessage,
    saveGig,
    saveMatches,
    updateMatchDecision,
    releaseEscrow,
  } = useAppState();

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} text-sm`}>Loading Milo...</p>
        </div>
      </div>
    );
  }

  if (!profile?.onboarding_complete || page === 'onboarding') {
    return (
      <OnboardingWizard
        onComplete={async (data) => {
          await saveProfile({ ...data, onboarding_complete: true });
          setPage('chat');
        }}
      />
    );
  }

  if (page === 'settings') {
    return (
      <SettingsPage
        profile={profile}
        theme={theme}
        onSave={async (data) => {
          await saveProfile(data);
        }}
        onBack={() => setPage('chat')}
        toggleTheme={toggleTheme}
      />
    );
  }

  if (page === 'wallet') {
    return (
      <WalletPage
        profile={profile}
        onBack={() => setPage('chat')}
        theme={theme}
      />
    );
  }

  if (page === 'browse') {
    return (
      <BrowseGigsPage
        profile={profile}
        onBack={() => setPage('chat')}
        theme={theme}
      />
    );
  }

  const themeClasses = theme === 'dark'
    ? 'bg-slate-950 text-white'
    : 'bg-gray-50 text-gray-900';

  const headerBg = theme === 'dark'
    ? 'bg-slate-900/50 border-slate-800/50'
    : 'bg-white/80 border-gray-200 shadow-sm';

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses}`}>
      {/* Header */}
      <header className={`sticky top-0 z-20 border-b backdrop-blur-sm flex-shrink-0 ${headerBg}`}>
        <div className="px-5 py-3.5 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none">Milo</h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'} leading-none mt-0.5`}>Campus Gig Marketplace</p>
            </div>
          </div>

          {/* User Info & Controls */}
          <div className="flex items-center gap-3">
            {/* Wallet Button */}
            <button
              onClick={() => setPage('wallet')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:block">${totalEscrow.toFixed(2)}</span>
            </button>

            {/* Browse Gigs Button (for 'both' role) */}
            {profile.role === 'both' && (
              <button
                onClick={() => setPage('browse')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20'
                    : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border border-cyan-200'
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:block">Browse</span>
              </button>
            )}

            {/* Profile */}
            <button
              onClick={() => setPage('settings')}
              className="flex items-center gap-2"
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className={`w-8 h-8 rounded-lg object-cover border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-300'}`} />
              ) : (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                  theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300 text-gray-700'
                }`}>
                  {profile.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{profile.name}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{profile.role} · {profile.campus_location || 'No location'}</p>
              </div>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>
        <ChatPage
          profile={profile}
          userId={userId}
          activeGigs={activeGigs}
          matches={matches}
          totalEscrow={totalEscrow}
          theme={theme}
          onOpenSettings={() => setPage('settings')}
          onOpenWallet={() => setPage('wallet')}
          onSaveGig={saveGig}
          onSaveMatches={saveMatches}
          onUpdateMatchDecision={updateMatchDecision}
          onReleaseEscrow={releaseEscrow}
          onPersistMessage={addMessage}
        />
      </div>
    </div>
  );
}

export default App;
