'use client';
import { useEffect, useState } from 'react';
import { Wallet, ShieldCheck, CalendarDays, TrendingUp, ArrowUpRight, Phone, MapPin, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

function StatCard({ icon: Icon, label, value, color = 'gold', sub }) {
  const colors = {
    gold:  'bg-gold-500/10 text-gold-500 border-gold-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  return (
    <div className="dash-card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AuthorDashboardPage() {
  const { profile } = useAuth();
  const [balance, setBalance]           = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingData, setLoadingData]   = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    (async () => {
      setLoadingData(true);
      const [{ data: bal }, { data: txns }] = await Promise.all([
        supabase.from('author_balances').select('balance').eq('author_id', profile.id).single(),
        supabase.from('balance_transactions').select('*')
          .eq('author_id', profile.id).order('created_at', { ascending: false }).limit(5),
      ]);
      setBalance(bal?.balance ?? 0);
      setTransactions(txns || []);
      setLoadingData(false);
    })();
  }, [profile?.id]);

  const statusConfig = {
    active:    { label: 'Active',    class: 'badge-active' },
    suspended: { label: 'Suspended', class: 'badge-suspended' },
    pending:   { label: 'Pending',   class: 'badge-pending' },
  };
  const statusInfo = statusConfig[profile?.status] || statusConfig.pending;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-gold-500">{profile?.full_name?.split(' ')[0]}!</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Here&apos;s an overview of your account.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Wallet}
          label="Current Balance"
          value={loadingData ? '—' : `$${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          color="gold"
          sub="Read only — managed by Amazon"
        />
        <StatCard
          icon={ShieldCheck}
          label="Account Status"
          value={<span className={statusInfo.class}>{statusInfo.label}</span>}
          color="green"
        />
        <StatCard
          icon={CalendarDays}
          label="Member Since"
          value={profile?.created_at ? format(new Date(profile.created_at), 'MMM d, yyyy') : '—'}
          color="blue"
        />
      </div>

      {/* Profile summary + transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile summary */}
        <div className="dash-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Profile Summary</h2>
            <a href="/dashboard/profile" className="text-gold-500 hover:text-gold-400 text-sm font-medium flex items-center gap-1 transition-colors">
              Edit <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="mb-5">
            <p className="text-lg font-bold text-white">{profile?.full_name}</p>
            <p className="text-sm text-slate-400">{profile?.email}</p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Mail,  label: 'Email',   value: profile?.email },
              { icon: Phone, label: 'Phone',   value: profile?.phone_number || 'Not set' },
              { icon: MapPin,label: 'Address', value: profile?.address || 'Not set' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
                  <p className="text-sm text-slate-200 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="dash-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Recent Transactions</h2>
            <TrendingUp className="w-4 h-4 text-gold-500" />
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-3 border-navy-700 border-t-gold-500 rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Wallet className="w-8 h-8 text-navy-700 mb-2" />
              <p className="text-slate-500 text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-navy-700/50 last:border-0">
                  <div>
                    <p className="text-xs text-slate-500">{t.notes || '—'}</p>
                    <p className="text-xs text-navy-600">{format(new Date(t.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <span className={`text-sm font-bold ${t.transaction_type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.transaction_type === 'credit' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
