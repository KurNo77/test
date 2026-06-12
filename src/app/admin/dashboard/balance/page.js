'use client';
import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Minus, Wallet, ArrowUpCircle, ArrowDownCircle, X, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function BalanceModal({ author, onClose, onUpdated }) {
  const { profile: adminProfile } = useAuth();
  const [type, setType]     = useState('credit');
  const [amount, setAmount] = useState('');
  const [notes, setNotes]   = useState('');
  const [saving, setSaving] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(author.balance ?? 0);

  // Fetch live balance when modal opens so preview is never stale
  useEffect(() => {
    supabase.from('author_balances').select('balance').eq('author_id', author.id).single()
      .then(({ data }) => { if (data) setCurrentBalance(Number(data.balance)); });
  }, [author.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { toast.error('Enter a valid positive amount'); return; }
    setSaving(true);
    try {
      // Always read fresh balance from DB to avoid stale-state overwrites
      const { data: fresh, error: fetchErr } = await supabase
        .from('author_balances').select('balance').eq('author_id', author.id).single();
      if (fetchErr) throw fetchErr;

      const liveBalance = Number(fresh?.balance ?? 0);
      const newBalance = type === 'credit'
        ? liveBalance + amt
        : Math.max(0, liveBalance - amt);

      setCurrentBalance(liveBalance); // keep preview in sync

      const { error: balErr } = await supabase.from('author_balances')
        .update({ balance: newBalance }).eq('author_id', author.id);
      if (balErr) throw balErr;

      const { error: txnErr } = await supabase.from('balance_transactions').insert({
        author_id:        author.id,
        amount:           amt,
        transaction_type: type,
        notes:            notes.trim() || null,
        created_by:       adminProfile?.id,
      });
      if (txnErr) throw txnErr;

      // Notify the author
      await supabase.from('notifications').insert({
        user_id: author.id,
        title:   type === 'credit' ? 'Balance Added' : 'Balance Deducted',
        message: `${type === 'credit' ? '+' : '-'}$${amt.toFixed(2)} has been ${type === 'credit' ? 'added to' : 'deducted from'} your account.${notes ? ` Note: ${notes}` : ''}`,
      });

      toast.success(`Balance ${type === 'credit' ? 'added' : 'deducted'} successfully`);
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const previewBalance = () => {
    const amt = parseFloat(amount) || 0;
    if (type === 'credit') return Number(currentBalance) + amt;
    return Math.max(0, Number(currentBalance) - amt);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Update Balance</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Author info */}
        <div className="flex items-center gap-3 bg-navy-700/50 rounded-xl p-3 mb-5">
          {author.profile_picture ? (
            <img src={author.profile_picture} alt={author.full_name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0">
              <span className="text-gold-500 text-sm font-bold">{author.full_name?.slice(0,2).toUpperCase()}</span>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-white">{author.full_name}</p>
            <p className="text-xs text-slate-400">Current: <span className="text-gold-400 font-bold">${Number(currentBalance).toFixed(2)}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('credit')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-medium text-sm transition-all
                ${type === 'credit'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'border-navy-700 text-slate-400 hover:border-emerald-500/30'}`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Add Credit
            </button>
            <button
              type="button"
              onClick={() => setType('debit')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-medium text-sm transition-all
                ${type === 'debit'
                  ? 'bg-red-500/10 border-red-500/40 text-red-400'
                  : 'border-navy-700 text-slate-400 hover:border-red-500/30'}`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Deduct
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field pl-8"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for this transaction"
              className="input-field"
            />
          </div>

          {/* Balance preview */}
          {amount && (
            <div className="bg-navy-700/50 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">New Balance</span>
              <span className={`text-lg font-bold ${type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                ${previewBalance().toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 btn-gold flex items-center justify-center gap-2 py-2.5 text-sm">
              {saving
                ? <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                : type === 'credit' ? <><Plus className="w-4 h-4" />Add Balance</> : <><Minus className="w-4 h-4" />Deduct</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BalancePage() {
  const [authors, setAuthors]     = useState([]);
  const [transactions, setTxns]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [txnLoading, setTxnLoading] = useState(true);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'author')
      .order('full_name');
    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    const { data } = await query;
    if (data) {
      const { data: balances } = await supabase
        .from('author_balances')
        .select('author_id, balance')
        .in('author_id', data.map((a) => a.id));

      const balMap = {};
      (balances || []).forEach((b) => { balMap[b.author_id] = b.balance; });
      setAuthors(data.map((a) => ({ ...a, balance: Number(balMap[a.id] ?? 0) })));
    }
    setLoading(false);
  }, [search]);

  const fetchTransactions = useCallback(async () => {
    setTxnLoading(true);
    const { data } = await supabase
      .from('balance_transactions')
      .select('*, profiles!balance_transactions_author_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(30);
    setTxns(data || []);
    setTxnLoading(false);
  }, []);

  useEffect(() => { fetchAuthors(); }, [fetchAuthors]);
  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleUpdated = () => {
    fetchAuthors();
    fetchTransactions();
  };

  const getBalance = (a) => Number(a.balance ?? 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Balance Manager</h1>
        <p className="text-slate-400 text-sm mt-1">Add, deduct, and track author balances</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Author balances list */}
        <div className="xl:col-span-2 dash-card overflow-hidden p-0">
          <div className="p-5 border-b border-navy-700">
            <h2 className="section-title mb-3">Author Balances</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search authors…"
                className="input-field pl-11"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-navy-700 border-t-gold-500 rounded-full animate-spin" />
            </div>
          ) : authors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <Wallet className="w-10 h-10 text-navy-700 mb-2" />
              <p className="text-slate-500 text-sm">No authors found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="pl-5">Author</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th className="pr-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {authors.map((a) => (
                    <tr key={a.id}>
                      <td className="pl-5">
                        <div>
                          <p className="text-sm font-medium text-white">{a.full_name}</p>
                          <p className="text-xs text-slate-500">{a.email}</p>
                        </div>
                      </td>
                      <td>
                        <span className="text-gold-400 font-bold">${getBalance(a).toFixed(2)}</span>
                      </td>
                      <td>
                        <span className={a.status === 'active' ? 'badge-active' : 'badge-suspended'}>{a.status}</span>
                      </td>
                      <td className="pr-5 text-right">
                        <button
                          onClick={() => setSelected({ ...a, balance: getBalance(a) })}
                          className="btn-gold py-1.5 px-3 text-xs flex items-center gap-1 ml-auto"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaction history */}
        <div className="dash-card overflow-hidden p-0">
          <div className="p-5 border-b border-navy-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold-500" />
            <h2 className="section-title">Transaction Log</h2>
          </div>
          {txnLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-4 border-navy-700 border-t-gold-500 rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-10">No transactions yet</p>
          ) : (
            <div className="divide-y divide-navy-700/50 max-h-[460px] overflow-y-auto">
              {transactions.map((t) => (
                <div key={t.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {t.profiles?.full_name || 'Unknown'}
                      </p>
                      {t.notes && <p className="text-xs text-slate-500 mt-0.5 truncate">{t.notes}</p>}
                      <p className="text-xs text-navy-600 mt-1">{format(new Date(t.created_at), 'MMM d, h:mm a')}</p>
                    </div>
                    <div className={`text-sm font-bold shrink-0 ${t.transaction_type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.transaction_type === 'credit' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <BalanceModal
          author={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
