import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Menu, Settings, Wallet, MapPin, DollarSign, Clock, Shield } from 'lucide-react';
import type { UserProfile, Gig, GigMatch, ChatMessage } from '../lib/supabase';
import { useMiloChat } from '../hooks/useMiloChat';
import { TelemetryCard } from './TelemetryCard';
import { MatchCard } from './MatchCard';

type Props = {
  profile: UserProfile;
  userId: string;
  activeGigs: Gig[];
  matches: GigMatch[];
  totalEscrow: number;
  theme: 'dark' | 'light';
  onOpenSettings: () => void;
  onOpenWallet?: () => void;
  onSaveGig: (gig: Parameters<import('../hooks/useAppState').useAppState['saveGig']>[0]) => Promise<{ data: Gig | null; error: unknown }>;
  onSaveMatches: (gigId: string, matches: GigMatch[]) => Promise<void>;
  onUpdateMatchDecision: (matchId: string, decision: 'accepted' | 'rejected') => Promise<void>;
  onReleaseEscrow: (matchId: string) => Promise<void>;
  onPersistMessage: (msg: Omit<ChatMessage, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
};

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

export function ChatPage({
  profile,
  userId,
  activeGigs,
  matches,
  totalEscrow,
  theme,
  onOpenSettings,
  onOpenWallet,
  onSaveGig,
  onSaveMatches,
  onUpdateMatchDecision,
  onReleaseEscrow,
  onPersistMessage,
}: Props) {
  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-gigs'>('browse');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    entries,
    isThinking,
    handleUserMessage,
    handleAcceptMatch,
    handleDeclineMatch,
    handleReleaseEscrow,
  } = useMiloChat({
    profile,
    userId,
    onSaveGig,
    onSaveMatches,
    onUpdateMatchDecision,
    onReleaseEscrow,
    onPersistMessage,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, isThinking]);

  const submit = () => {
    const val = input.trim();
    if (!val) return;
    setInput('');
    void handleUserMessage(val);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const isDark = theme === 'dark';

  const pendingMatches = matches.filter((m) => m.decision === null && m.escrow_status === 'pending');
  const acceptedMatches = matches.filter((m) => m.decision === 'accepted');

  return (
    <div className={`flex h-full ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Left Sidebar - Gig Browser */}
      {showSidebar && (
        <div className={`w-80 flex-shrink-0 border-r flex flex-col ${
          isDark ? 'bg-slate-900/30 border-slate-800/60' : 'bg-white border-gray-200'
        }`}>
          <div className={`p-4 border-b ${isDark ? 'border-slate-800/60' : 'border-gray-200'}`}>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('browse')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'browse'
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                    : isDark
                      ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Browse
              </button>
              <button
                onClick={() => setActiveTab('my-gigs')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'my-gigs'
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                    : isDark
                      ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                My Gigs
              </button>
            </div>

            {totalEscrow > 0 && (
              <button
                onClick={onOpenWallet}
                className={`w-full p-3 rounded-lg flex items-center justify-between ${
                  isDark
                    ? 'bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20'
                    : 'bg-amber-50 border border-amber-200 hover:bg-amber-100'
                } transition-all`}
              >
                <div className="flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className={`text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Escrow Balance</span>
                </div>
                <span className={`text-sm font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                  ${totalEscrow.toFixed(2)}
                </span>
              </button>
            )}
          </div>

          <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {activeTab === 'browse' ? (
              <>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  Available Near You
                </h3>
                {activeGigs.filter((g) => g.type === 'post' && g.status === 'open').length === 0 ? (
                  <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-gray-500'}`}>
                    No gigs available. Ask Milo to search!
                  </p>
                ) : (
                  activeGigs
                    .filter((g) => g.type === 'post' && g.status === 'open')
                    .slice(0, 5)
                    .map((gig) => (
                      <div
                        key={gig.id}
                        className={`p-3 rounded-lg border transition-all ${
                          isDark
                            ? 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600'
                            : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}
                      >
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {gig.title}
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                          {gig.category}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-500' : 'text-gray-600'}`}>
                            <DollarSign className="w-3 h-3 text-emerald-500" />
                            ${gig.pay_min}–${gig.pay_max}
                          </span>
                          <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-500' : 'text-gray-600'}`}>
                            <MapPin className="w-3 h-3 text-blue-500" />
                            {gig.campus_location || 'Campus'}
                          </span>
                        </div>
                      </div>
                    ))
                )}

                {pendingMatches.length > 0 && (
                  <>
                    <h3 className={`text-xs font-semibold uppercase tracking-wider mt-4 mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      Pending Matches
                    </h3>
                    {pendingMatches.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-lg ${
                          isDark
                            ? 'bg-amber-500/10 border border-amber-500/30'
                            : 'bg-amber-50 border border-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {m.matched_user_name}
                          </span>
                          <span className={`text-xs ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                            {m.match_score}%
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                          {m.title}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </>
            ) : (
              <>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  Your Active Gigs
                </h3>
                {activeGigs.length === 0 ? (
                  <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-gray-500'}`}>
                    No active gigs. Tell Milo what you need!
                  </p>
                ) : (
                  activeGigs.slice(0, 10).map((gig) => (
                    <div
                      key={gig.id}
                      className={`p-3 rounded-lg border ${
                        isDark
                          ? 'bg-slate-800/40 border-slate-700/40'
                          : 'bg-white border-gray-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          gig.status === 'open' ? 'bg-slate-400' :
                          gig.status === 'matched' ? 'bg-emerald-400' :
                          gig.status === 'in_progress' ? 'bg-cyan-400' : 'bg-blue-400'
                        }`} />
                        <span className={`text-xs capitalize ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                          {gig.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {gig.title}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                        {gig.category}
                      </p>
                    </div>
                  ))
                )}

                {acceptedMatches.length > 0 && (
                  <>
                    <h3 className={`text-xs font-semibold uppercase tracking-wider mt-4 mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      Accepted Matches
                    </h3>
                    {acceptedMatches.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-lg ${
                          isDark
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {m.matched_user_name}
                          </span>
                          <span className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {m.escrow_status}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                          {m.title}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          isDark ? 'bg-slate-900/30 border-slate-800/60' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`lg:hidden p-2 rounded-lg transition-all ${
                isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
              }`}
            >
              <Menu className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Milo
                </h2>
                <p className="text-xs text-emerald-500">Your Agentic Concierge</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              isDark
                ? 'bg-slate-800/50 border border-slate-700/50'
                : 'bg-gray-100 border border-gray-200'
            }`}>
              <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                AI-Powered
              </span>
            </div>
            {onOpenWallet && (
              <button
                onClick={onOpenWallet}
                className={`p-2 rounded-lg transition-all ${
                  isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
                }`}
              >
                <Wallet className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-lg transition-all ${
                isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
              }`}
            >
              <Settings className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0 ${
          isDark ? 'bg-slate-950' : 'bg-gray-50'
        }`}>
          {entries.map((entry) => {
            const isAgent = entry.role === 'agent';

            if (entry.type === 'telemetry') {
              return (
                <div key={entry.id} className="flex gap-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 max-w-[85%]">
                    <TelemetryCard theme={theme} />
                  </div>
                </div>
              );
            }

            if (entry.type === 'match_cards' && entry.matches) {
              return (
                <div key={entry.id} className="flex gap-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 max-w-[90%] space-y-3">
                    <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      {entry.matches.length} match{entry.matches.length !== 1 ? 'es' : ''} found
                    </p>
                    {entry.matches.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        theme={theme}
                        onAccept={(id) => void handleAcceptMatch(id, entry.matches!)}
                        onDecline={(id) => void handleDeclineMatch(id)}
                        onReleaseEscrow={(id) => void handleReleaseEscrow(id, entry.matches!)}
                      />
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={entry.id}
                className={`flex gap-3 ${isAgent ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isAgent
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-500'
                      : isDark ? 'bg-slate-700' : 'bg-gray-300'
                  }`}
                >
                  {isAgent ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`} />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    isAgent
                      ? entry.type === 'error'
                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-tl-sm'
                        : entry.type === 'status'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-tl-sm'
                        : isDark
                          ? 'bg-slate-800/80 text-slate-200 rounded-tl-sm'
                          : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200 shadow-sm'
                      : 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-tr-sm'
                  }`}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.content) }}
                />
              </div>
            );
          })}

          {isThinking && (
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${
                isDark ? 'bg-slate-800/80' : 'bg-white border border-gray-200'
              }`}>
                <div className="flex gap-1 items-center h-4">
                  <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDark ? 'bg-slate-400' : 'bg-gray-500'}`} style={{ animationDelay: '0ms' }} />
                  <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDark ? 'bg-slate-400' : 'bg-gray-500'}`} style={{ animationDelay: '150ms' }} />
                  <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDark ? 'bg-slate-400' : 'bg-gray-500'}`} style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className={`px-4 pb-4 pt-2 border-t ${
          isDark ? 'border-slate-800/60' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message Milo..."
                rows={1}
                className={`w-full px-4 py-3 pr-4 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 transition-all ${
                  isDark
                    ? 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 focus:border-cyan-500/60 focus:ring-cyan-500/20 text-white placeholder-slate-500'
                    : 'bg-white border-gray-300 hover:border-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 text-gray-900 placeholder-gray-400'
                }`}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              onClick={submit}
              disabled={!input.trim() || isThinking}
              className="w-11 h-11 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:shadow-none flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className={`text-xs mt-2 text-center ${isDark ? 'text-slate-600' : 'text-gray-500'}`}>
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
