'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Users, BarChart2, Globe, ArrowRight } from 'lucide-react';

const ADS = [
  {
    icon: BookOpen,
    color: 'text-gold-500',
    iconBg: 'bg-gold-500/15 border-gold-500/30',
    gradient: 'from-gold-500/10 via-navy-800 to-navy-900',
    accent: 'bg-gold-500',
    tag: 'For Authors',
    title: 'Publish Your Book',
    desc: 'Reach millions of readers on Amazon. List your book today and start earning royalties worldwide.',
    cta: 'Learn More',
    ctaClass: 'bg-gold-500 text-navy-900 hover:bg-gold-400',
    dot: 'bg-gold-500',
  },
  {
    icon: BarChart2,
    color: 'text-blue-400',
    iconBg: 'bg-blue-500/15 border-blue-500/30',
    gradient: 'from-blue-500/10 via-navy-800 to-navy-900',
    accent: 'bg-blue-400',
    tag: 'Analytics',
    title: 'Track Your Sales',
    desc: 'Real-time dashboards and earnings reports. See exactly how your books perform across every market.',
    cta: 'View Dashboard',
    ctaClass: 'bg-blue-500 text-white hover:bg-blue-400',
    dot: 'bg-blue-400',
  },
  {
    icon: Globe,
    color: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30',
    gradient: 'from-emerald-500/10 via-navy-800 to-navy-900',
    accent: 'bg-emerald-400',
    tag: 'Global Reach',
    title: 'Go Global',
    desc: 'Sell your books in 180+ countries. Connect with readers everywhere around the world.',
    cta: 'Get Started',
    ctaClass: 'bg-emerald-500 text-white hover:bg-emerald-400',
    dot: 'bg-emerald-400',
  },
  {
    icon: Users,
    color: 'text-purple-400',
    iconBg: 'bg-purple-500/15 border-purple-500/30',
    gradient: 'from-purple-500/10 via-navy-800 to-navy-900',
    accent: 'bg-purple-400',
    tag: 'Community',
    title: 'Grow Your Readers',
    desc: 'Build a loyal readership. Connect directly with fans, manage your author page, and grow your brand.',
    cta: 'Join Now',
    ctaClass: 'bg-purple-500 text-white hover:bg-purple-400',
    dot: 'bg-purple-400',
  },
];

export default function HomePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [adIndex, setAdIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setAdIndex((i) => (i + 1) % ADS.length);
        setFading(false);
      }, 400);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

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

        {/* ── Left Ad Banner — rotating ── */}
        <aside className="hidden xl:flex flex-col items-center gap-3 px-4 pt-2 shrink-0 w-52">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">Advertisement</p>

          {(() => {
            const ad = ADS[adIndex];
            const Icon = ad.icon;
            return (
              <div
                className={`w-44 rounded-2xl border border-navy-700 bg-gradient-to-b ${ad.gradient} flex flex-col items-center justify-between gap-4 text-center p-6 transition-opacity duration-400 overflow-hidden relative`}
                style={{ minHeight: '520px', opacity: fading ? 0 : 1, transition: 'opacity 0.4s ease' }}
              >
                {/* Glow blob */}
                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-20 ${ad.accent}`} />

                <div className="relative z-10 flex flex-col items-center gap-4 flex-1 justify-center">
                  {/* Tag */}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${ad.iconBg} ${ad.color}`}>
                    {ad.tag}
                  </span>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${ad.iconBg}`}>
                    <Icon className={`w-8 h-8 ${ad.color}`} />
                  </div>

                  {/* Text */}
                  <p className="text-base font-extrabold text-white leading-tight">{ad.title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{ad.desc}</p>

                  {/* CTA */}
                  <button className={`mt-2 px-5 py-2 rounded-xl text-xs font-bold transition-colors ${ad.ctaClass}`}>
                    {ad.cta}
                  </button>
                </div>

                {/* Progress dots */}
                <div className="relative z-10 flex items-center gap-1.5 mt-2">
                  {ADS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setFading(true); setTimeout(() => { setAdIndex(i); setFading(false); }, 400); }}
                      className={`rounded-full transition-all duration-300 ${i === adIndex ? `w-5 h-1.5 ${ad.accent}` : 'w-1.5 h-1.5 bg-navy-600 hover:bg-navy-500'}`}
                    />
                  ))}
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy-700">
                  <div
                    key={adIndex}
                    className={`h-full ${ad.accent} rounded-full`}
                    style={{ animation: fading ? 'none' : 'adProgress 7s linear forwards' }}
                  />
                </div>
              </div>
            );
          })()}

          <style>{`
            @keyframes adProgress {
              from { width: 0% }
              to   { width: 100% }
            }
          `}</style>
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
