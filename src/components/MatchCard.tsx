import React from 'react';
import { MapPin, Clock, DollarSign, Star, CheckCircle, XCircle, Shield, Tag } from 'lucide-react';
import type { GigMatch } from '../lib/supabase';

type Props = {
  match: GigMatch;
  theme?: 'dark' | 'light';
  onAccept: (matchId: string) => void;
  onDecline: (matchId: string) => void;
  onReleaseEscrow?: (matchId: string) => void;
};

export function MatchCard({ match, theme = 'dark', onAccept, onDecline, onReleaseEscrow }: Props) {
  const isDark = theme === 'dark';

  const scoreColor =
    match.match_score >= 90
      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
      : match.match_score >= 80
      ? 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30'
      : match.match_score >= 70
      ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
      : 'text-rose-500 bg-rose-500/10 border-rose-500/30';

  const escrowBadge = {
    pending: { label: 'Escrow: Pending', color: isDark ? 'text-slate-400 bg-slate-700/50' : 'text-gray-500 bg-gray-200' },
    held: { label: 'Escrow: Held', color: 'text-amber-500 bg-amber-500/10' },
    released: { label: 'Escrow: Released', color: 'text-emerald-500 bg-emerald-500/10' },
    disputed: { label: 'Escrow: Disputed', color: 'text-rose-500 bg-rose-500/10' },
  }[match.escrow_status];

  const isDecided = match.decision !== null;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        match.decision === 'accepted'
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : match.decision === 'rejected'
          ? isDark
            ? 'border-slate-700/30 bg-slate-800/20 opacity-50'
            : 'border-gray-200 bg-gray-100 opacity-50'
          : isDark
            ? 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600'
            : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {match.matched_user_name}
            </h4>
            {match.decision === 'accepted' && (
              <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                <CheckCircle className="w-3 h-3" /> Accepted
              </span>
            )}
          </div>
          <span className={`inline-flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            <Tag className="w-3 h-3" />
            {match.category}
          </span>
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold ml-3 flex-shrink-0 ${scoreColor}`}>
          <Star className="w-3 h-3 fill-current" />
          {match.match_score}% match
        </div>
      </div>

      {/* Details */}
      <p className={`text-xs mb-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        {match.description}
      </p>

      <div className="flex flex-wrap gap-3 mb-3">
        <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          <span>${match.pay_min}–${match.pay_max}</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          <span>{match.campus_location}</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>{match.walk_time_mins} min walk</span>
        </div>
      </div>

      {/* Escrow badge */}
      {match.decision === 'accepted' && (
        <div className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg mb-3 ${escrowBadge.color}`}>
          <Shield className="w-3 h-3" />
          {escrowBadge.label}
        </div>
      )}

      {/* Actions */}
      {!isDecided ? (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onAccept(match.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-xs font-semibold rounded-lg transition-all shadow-sm shadow-emerald-500/20"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Accept
          </button>
          <button
            onClick={() => onDecline(match.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 border text-xs font-semibold rounded-lg transition-all ${
              isDark
                ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300'
                : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Decline
          </button>
        </div>
      ) : match.decision === 'accepted' && match.escrow_status === 'held' && onReleaseEscrow ? (
        <button
          onClick={() => onReleaseEscrow(match.id)}
          className="w-full mt-3 py-2 border border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 text-xs font-semibold rounded-lg transition-all"
        >
          Release Escrow Payment
        </button>
      ) : null}
    </div>
  );
}
