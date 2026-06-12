'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', data.user.id)
        .single();

      if (pError) throw pError;

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        toast.error('Access denied. Admin credentials required.');
        return;
      }
      if (profile?.status === 'suspended') {
        await supabase.auth.signOut();
        toast.error('This admin account has been suspended.');
        return;
      }

      toast.success('Welcome, Administrator!');
      router.push('/admin/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/30 mb-4 animate-pulse-gold">
            <ShieldCheck className="w-8 h-8 text-gold-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Restricted access — administrators only</p>
        </div>

        <div className="bg-navy-800 border border-gold-500/20 rounded-2xl p-8 shadow-gold">
          {/* Warning banner */}
          <div className="flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-xl px-4 py-3 mb-6">
            <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0" />
            <p className="text-gold-400 text-xs font-medium">Admin access only. Unauthorized attempts are logged.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Admin Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-600 hover:text-gold-500 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="w-5 h-5 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
              ) : (
                <><ShieldCheck className="w-4 h-4" /> Admin Sign In</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-navy-600 mt-4">
          <Link href="/login" className="text-slate-500 hover:text-gold-500 transition-colors">
            ← Back to Author Login
          </Link>
        </p>
      </div>
    </div>
  );
}
