'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Users, BarChart2, Globe, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && profile?.role === 'admin') router.replace('/admin/dashboard');
    else if (user && profile?.role === 'author') router.replace('/dashboard');
  }, [user, profile, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900">
      <div className="w-10 h-10 rounded-full border-4 border-navy-700 border-t-gold-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">

      {/* ── Navigation ── */}
      <header className="w-full border-b border-navy-800 bg-navy-900/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-xl tracking-tight">
              amazon <span className="text-gold-500">author central</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-2">
            <Link href="/register"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-navy-800 transition-colors">
              Join
            </Link>
            <Link href="/login"
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-gold-500 text-navy-900 hover:bg-gold-400 transition-colors">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="flex-1 w-full py-20 flex flex-col lg:flex-row items-start gap-0">

        {/* ── Left Ad Banner ── */}
        <aside className="hidden xl:flex flex-col items-center gap-3 px-4 pt-2 shrink-0 w-44">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">Advertisement</p>

          {/* Ad slot 1 — skyscraper */}
          <div className="w-36 h-72 rounded-2xl border border-navy-700 bg-navy-800/60 flex flex-col items-center justify-center gap-3 text-center p-4 hover:border-gold-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-gold-500" />
            </div>
            <p className="text-xs font-bold text-slate-300">Publish Your Book</p>
            <p className="text-[11px] text-slate-500 leading-tight">Reach millions of readers on Amazon today</p>
            <span className="mt-1 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-[11px] text-gold-500 font-semibold">Learn More</span>
          </div>

          {/* Ad slot 2 — square */}
          <div className="w-36 h-36 rounded-2xl border border-navy-700 bg-navy-800/60 flex flex-col items-center justify-center gap-2 text-center p-3 hover:border-blue-500/30 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs font-bold text-slate-300">Track Sales</p>
            <p className="text-[10px] text-slate-500 leading-tight">Real-time analytics for authors</p>
          </div>

          {/* Ad slot 3 — tall */}
          <div className="w-36 h-48 rounded-2xl border border-navy-700 bg-navy-800/60 flex flex-col items-center justify-center gap-2 text-center p-4 hover:border-emerald-500/30 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs font-bold text-slate-300">Go Global</p>
            <p className="text-[10px] text-slate-500 leading-tight">Sell your books in 180+ countries worldwide</p>
            <span className="mt-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-semibold">Get Started</span>
          </div>
        </aside>

        {/* ── Main Hero Content ── */}
        <div className="flex-1 max-w-5xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-14">
        {/* Left */}
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
            <span className="text-gold-500 text-xs font-semibold tracking-wider uppercase">Amazon Author Central</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
            Help readers around<br />
            the world <span className="text-gold-500">discover</span><br />
            your books.
          </h1>

          <div className="w-12 h-1 bg-gold-500 rounded-full" />

          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            We'll make it easy for you to keep your Amazon Author Pages up to date
            and stay informed about what's happening with all of your books.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <Link href="/register"
              className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-gold-500/20 text-sm">
              Join for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="text-gold-500 hover:text-gold-400 font-semibold text-sm transition-colors">
              Sign in →
            </Link>
          </div>
        </div>

        {/* Right — decorative card grid */}
        <div className="flex-1 grid grid-cols-2 gap-4 max-w-md w-full">
          {[
            { icon: BookOpen,  label: 'Manage Books',     desc: 'Keep your catalog up to date',       color: 'text-gold-500',    bg: 'bg-gold-500/10 border-gold-500/20' },
            { icon: Users,     label: 'Grow Readers',     desc: 'Connect with your audience',         color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
            { icon: BarChart2, label: 'Track Earnings',   desc: 'Monitor your balance & payouts',     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { icon: Globe,     label: 'Global Reach',     desc: 'Reach readers in every country',     color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
          ].map(({ icon: Icon, label, desc, color, bg }) => (
            <div key={label} className={`rounded-2xl border p-5 ${bg} hover:scale-[1.03] transition-transform`}>
              <div className={`w-10 h-10 rounded-xl ${bg} border flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className={`text-sm font-bold ${color}`}>{label}</p>
              <p className="text-xs text-slate-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
        </div>{/* end main hero content */}
      </section>

      {/* ── Welcome banner ── */}
      <section className="border-t border-navy-800 bg-navy-800/50 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Welcome to the new, updated Amazon Author Central.</h2>
          <p className="text-slate-400 leading-relaxed">
            Our new hub for all things author brings you easier access to a suite of tools to help you
            reach your goals as an author. If you already have an Author Central account, come on in.
            We've moved everything for you.
          </p>
          <p className="text-slate-500 text-sm">And if you're new, here's what you can get by joining Amazon Author Central:</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {['Author Page', 'Sales Dashboard', 'Balance Tracking', 'Notifications', 'Support'].map((f) => (
              <span key={f} className="px-4 py-1.5 bg-navy-700 border border-navy-600 rounded-full text-xs text-slate-300 font-medium">{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-navy-800 py-6 px-6 text-center">
        <p className="text-slate-600 text-xs">© 2026 Amazon Author Central. All rights reserved.</p>
      </footer>
    </div>
  );
}
