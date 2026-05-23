import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, Plus, TrendingUp, TrendingDown, CreditCard, Clock, CheckCircle, AlertCircle, Loader2, DollarSign } from 'lucide-react';
import { supabase, type Wallet as WalletType, type WalletTransaction, type UserProfile } from '../lib/supabase';

type Props = {
  profile: UserProfile;
  onBack: () => void;
  theme?: 'dark' | 'light';
  onWalletUpdate?: (wallet: WalletType) => void;
};

const QUICK_AMOUNTS = [25, 50, 100, 200];

export function WalletPage({ profile, onBack, theme = 'dark', onWalletUpdate }: Props) {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingMoney, setAddingMoney] = useState(false);
  const [amount, setAmount] = useState(50);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    loadWalletData();
  }, [profile.user_id]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      // Get or create wallet
      let walletRes = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', profile.user_id)
        .maybeSingle();

      if (!walletRes.data) {
        // Create wallet if doesn't exist
        const createRes = await supabase
          .from('wallets')
          .insert([{ user_id: profile.user_id, balance: 0, total_earned: 0, total_spent: 0 }])
          .select()
          .single();
        walletRes = { data: createRes.data, error: createRes.error };
      }

      if (walletRes.data) {
        setWallet(walletRes.data as WalletType);
        onWalletUpdate?.(walletRes.data as WalletType);

        // Load transactions
        const txRes = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', profile.user_id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (txRes.data) {
          setTransactions(txRes.data as WalletTransaction[]);
        }
      }
    } catch (err) {
      console.error('Error loading wallet:', err);
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    if (!wallet || amount <= 0) return;

    setAddingMoney(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate payment processing (2 second delay)
      await new Promise((r) => setTimeout(r, 2000));

      // Create deposit transaction
      const txRes = await supabase
        .from('wallet_transactions')
        .insert([{
          wallet_id: wallet.id,
          user_id: profile.user_id,
          type: 'deposit',
          amount: amount,
          description: 'Added money via simulated payment'
        }])
        .select()
        .single();

      if (txRes.error) throw txRes.error;

      // Update wallet balance
      const updateRes = await supabase
        .from('wallets')
        .update({
          balance: wallet.balance + amount,
          total_earned: wallet.total_earned + amount
        })
        .eq('id', wallet.id)
        .select()
        .single();

      if (updateRes.data) {
        setWallet(updateRes.data as WalletType);
        onWalletUpdate?.(updateRes.data as WalletType);
        setSuccess(`Successfully added $${amount.toFixed(2)} to your wallet!`);
        setShowAddMoney(false);
        setAmount(50);

        // Refresh transactions
        const txRes = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', profile.user_id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (txRes.data) {
          setTransactions(txRes.data as WalletTransaction[]);
        }
      }
    } catch (err) {
      console.error('Error adding money:', err);
      setError('Failed to add money. Please try again.');
    } finally {
      setAddingMoney(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getTransactionIcon = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'escrow_hold':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'escrow_release':
      case 'payment':
        return <TrendingDown className="w-4 h-4 text-rose-400" />;
      case 'refund':
        return <CreditCard className="w-4 h-4 text-blue-400" />;
      default:
        return <DollarSign className="w-4 h-4 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/60 px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-semibold">Wallet</span>
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-slate-900 rounded-2xl border border-cyan-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Available Balance</p>
              <h2 className="text-4xl font-bold text-white">${wallet?.balance.toFixed(2) || '0.00'}</h2>
            </div>
            <button
              onClick={() => setShowAddMoney(!showAddMoney)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl text-white text-sm font-semibold transition-all shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Money
            </button>
          </div>

          {/* Earnings Summary */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-700/50">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Total Earned</span>
              </div>
              <p className="text-lg font-semibold text-white">${wallet?.total_earned.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-rose-400 mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Total Spent</span>
              </div>
              <p className="text-lg font-semibold text-white">${wallet?.total_spent.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Add Money Modal */}
        {showAddMoney && (
          <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-6 animate-in">
            <h3 className="text-lg font-semibold text-white mb-4">Add Money to Wallet</h3>

            {/* Quick Amounts */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    amount === amt
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Or enter a custom amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  min={5}
                  max={1000}
                  step={5}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(5, Math.min(1000, Number(e.target.value))))}
                  className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            {/* Simulated Payment Notice */}
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg mb-4">
              <p className="text-xs text-cyan-400">
                This is a simulated payment. No real money will be charged. Perfect for testing and demos.
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg mb-4">
                <p className="text-xs text-rose-400">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-4">
                <p className="text-xs text-emerald-400">{success}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddMoney(false)}
                disabled={addingMoney}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMoney}
                disabled={addingMoney || amount <= 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl text-sm font-semibold transition-all disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed"
              >
                {addingMoney ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Add ${amount.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Transaction History</h3>
            <span className="text-xs text-slate-500">{transactions.length} transactions</span>
          </div>

          {transactions.length === 0 ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800/60 p-8 text-center">
              <Clock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No transactions yet</p>
              <p className="text-slate-600 text-xs mt-1">Add money to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-all"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    tx.type === 'deposit' ? 'bg-emerald-500/10' :
                    tx.type === 'escrow_hold' ? 'bg-amber-500/10' :
                    'bg-rose-500/10'
                  }`}>
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {formatDate(tx.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      tx.type === 'deposit' || tx.type === 'refund' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-600 capitalize">{tx.type.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
