'use client';
import { useEffect, useState } from 'react';
import { Users, Wallet, UserPlus, ShieldCheck, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format, startOfMonth } from 'date-fns';

function StatCard({ icon: Icon, label, value, color = 'gold', loading }) {
  const colors = {
    gold:  'bg-gold-500/10 text-gold-500 border-gold-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple:'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  return (
    <div className="dash-card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        {loading ? (
          <div className="h-8 w-24 bg-navy-700 animate-pulse rounded-lg mt-1" />
        ) : (
          <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [txns, setTxns]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const monthStart = startOfMonth(new Date()).toISOString();

      const [
        { count: totalAuthors },
        { count: activeAuthors },
        { count: newRegs },
        { data: balSum },
        { data: recentAuthors },
        { data: recentTxns },
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'author'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'author').eq('status', 'active'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'author').gte('created_at', monthStart),
        supabase.from('author_balances').select('balance'),
        supabase.from('profiles').select('id, full_name, email, status, created_at')
          .eq('role', 'author').order('created_at', { ascending: false }).limit(5),
        supabase.from('balance_transactions').select('*, profiles(full_name)')
          .order('created_at', { ascending: false }).limit(5),
      ]);

      const totalBalance = (balSum || []).reduce((s, r) => s + Number(r.balance), 0);
      setStats({ totalAuthors, activeAuthors, newRegs, totalBalance });
      setRecent(recentAuthors || []);
      setTxns(recentTxns || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="Total Authors"      value={stats?.totalAuthors  ?? 0} color="blue"   loading={loading} />
        <StatCard icon={ShieldCheck}label="Active Authors"     value={stats?.activeAuthors ?? 0} color="green"  loading={loading} />
        <StatCard icon={UserPlus}   label="New This Month"     value={stats?.newRegs       ?? 0} color="purple" loading={loading} />
        <StatCard icon={Wallet}     label="Total Balance"
          value={loading ? '—' : `$${Number(stats?.totalBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          color="gold" loading={loading} />
      </div>

      {/* Recent authors + transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent registrations */}
        <div className="dash-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Registrations</h2>
            <a href="/admin/dashboard/authors" className="text-gold-500 hover:text-gold-400 text-sm font-medium transition-colors">
              View all →
            </a>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-12 bg-navy-700 rounded-xl animate-pulse" />)}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No authors yet</p>
          ) : (
            <div className="divide-y divide-navy-700/50">
              {recent.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{a.full_name}</p>
                    <p className="text-xs text-slate-500">{a.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={a.status === 'active' ? 'badge-active' : a.status === 'suspended' ? 'badge-suspended' : 'badge-pending'}>
                      {a.status}
                    </span>
                    <p className="text-xs text-navy-600 mt-1">
                      {format(new Date(a.created_at), 'MMM d')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="dash-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Transactions</h2>
            <a href="/admin/dashboard/balance" className="text-gold-500 hover:text-gold-400 text-sm font-medium transition-colors">
              View all →
            </a>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-12 bg-navy-700 rounded-xl animate-pulse" />)}
            </div>
          ) : txns.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No transactions yet</p>
          ) : (
            <div className="divide-y divide-navy-700/50">
              {txns.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{t.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500 capitalize">{t.transaction_type} · {t.notes || '—'}</p>
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
