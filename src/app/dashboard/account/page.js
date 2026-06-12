'use client';
import { useEffect, useState } from 'react';
import { Wallet, User, CalendarDays, ShieldCheck, Phone, MapPin, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-navy-700/50 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gold-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
        <p className={`text-sm mt-0.5 font-medium truncate ${highlight ? 'text-gold-400' : 'text-white'}`}>
          {value || <span className="text-slate-500 font-normal italic">Not provided</span>}
        </p>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { profile } = useAuth();
  const [balance, setBalance]       = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    (async () => {
      const { data } = await supabase
        .from('author_balances')
        .select('balance, updated_at')
        .eq('author_id', profile.id)
        .single();
      setBalance(data);
      setLoading(false);
    })();
  }, [profile?.id]);

  const statusColors = {
    active:    'badge-active',
    suspended: 'badge-suspended',
    pending:   'badge-pending',
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Information</h1>
        <p className="text-slate-400 text-sm mt-1">View your complete account details</p>
      </div>

      {/* Account Summary card */}
      <div className="dash-card">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-navy-700">
          {profile?.profile_picture ? (
            <img src={profile.profile_picture} alt={profile.full_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-gold-500/30 shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border-2 border-gold-500/20 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-gold-500" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-white">{profile?.full_name}</h2>
            <span className={statusColors[profile?.status] || 'badge-pending'}>
              {profile?.status || 'pending'}
            </span>
          </div>
        </div>

        <InfoRow icon={Mail}        label="Email Address"     value={profile?.email} />
        <InfoRow icon={Phone}       label="Phone Number"      value={profile?.phone_number} />
        <InfoRow icon={MapPin}      label="Address"           value={profile?.address} />
        <InfoRow icon={CalendarDays}label="Registration Date" value={profile?.created_at ? format(new Date(profile.created_at), 'MMMM d, yyyy') : '—'} />
        <InfoRow icon={ShieldCheck} label="Account Role"      value={profile?.role === 'admin' ? 'Administrator' : 'Author'} highlight />
      </div>

      {/* Balance card (read-only) */}
      <div className="dash-card border-gold-500/20">
        <div className="flex items-center justify-between mb-2">
          <h2 className="section-title">Balance Overview</h2>
          <Lock className="w-4 h-4 text-gold-500" />
        </div>
        <p className="text-xs text-slate-500 mb-4">Managed exclusively by administrators</p>

        <div className="bg-gold-500/5 border border-gold-500/20 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Current Balance</p>
            <p className="text-3xl font-black text-gold-400 mt-1">
              {loading ? '—' : `$${Number(balance?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </p>
            {balance?.updated_at && (
              <p className="text-xs text-slate-500 mt-1">
                Last updated {format(new Date(balance.updated_at), 'MMM d, yyyy')}
              </p>
            )}
          </div>
          <Wallet className="w-12 h-12 text-gold-500/30" />
        </div>
      </div>
    </div>
  );
}
