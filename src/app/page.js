'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Users, BarChart2, Globe, ArrowRight, Headphones, Tv, PlayCircle } from 'lucide-react';

const ADS = [
  {
    icon: BookOpen,
    img: '/ads/barnesnoble.svg',
    brandColor: '#1D7A4E',
    brandColorLight: 'rgba(29,122,78,0.15)',
    brandColorBorder: 'rgba(29,122,78,0.35)',
    glowColor: '#1D7A4E',
    gradientFrom: 'rgba(29,122,78,0.12)',
    brand: 'Barnes & Noble',
    tag: 'Books & More',
    title: 'Discover Your Next Great Read',
    desc: 'Millions of books, ebooks, NOOK titles, and textbooks. Free shipping on orders over $35.',
    cta: 'Shop Now',
    barColor: '#1D7A4E',
  },
  {
    icon: Headphones,
    img: '/ads/spotify.svg',
    brandColor: '#1DB954',
    brandColorLight: 'rgba(29,185,84,0.15)',
    brandColorBorder: 'rgba(29,185,84,0.35)',
    glowColor: '#1DB954',
    gradientFrom: 'rgba(29,185,84,0.12)',
    brand: 'Spotify',
    tag: 'Music & Podcasts',
    title: 'Listen Without Limits',
    desc: 'Stream over 100 million songs, discover new artists, and enjoy ad-free music anytime.',
    cta: 'Try Free',
    barColor: '#1DB954',
  },
  {
    icon: PlayCircle,
    img: '/ads/netflix.svg',
    brandColor: '#E50914',
    brandColorLight: 'rgba(229,9,20,0.15)',
    brandColorBorder: 'rgba(229,9,20,0.35)',
    glowColor: '#E50914',
    gradientFrom: 'rgba(229,9,20,0.12)',
    brand: 'Netflix',
    tag: 'Streaming',
    title: 'Watch Anywhere, Anytime',
    desc: 'Unlimited movies, TV shows, and more. Watch on your phone, tablet, laptop, and TV.',
    cta: 'Start Watching',
    barColor: '#E50914',
  },
  {
    icon: Tv,
    img: '/ads/hulu.svg',
    brandColor: '#1CE783',
    brandColorLight: 'rgba(28,231,131,0.15)',
    brandColorBorder: 'rgba(28,231,131,0.35)',
    glowColor: '#1CE783',
    gradientFrom: 'rgba(28,231,131,0.12)',
    brand: 'Hulu',
    tag: 'Live & On Demand',
    title: 'Stream Live TV & More',
    desc: 'Watch live TV, sports, news, and thousands of shows and movies. No cable required.',
    cta: 'Get Hulu',
    barColor: '#1CE783',
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
            return (
              <div
                className="w-44 rounded-2xl border border-navy-700 flex flex-col items-center justify-between gap-4 text-center p-6 overflow-hidden relative"
                style={{
                  minHeight: '520px',
                  opacity: fading ? 0 : 1,
                  transition: 'opacity 0.4s ease',
                  background: `linear-gradient(to bottom, ${ad.gradientFrom}, #1e293b, #0f172a)`,
                }}
              >
                {/* Glow blob */}
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-25"
                  style={{ backgroundColor: ad.glowColor }}
                />

                <div className="relative z-10 flex flex-col items-center gap-3 flex-1 justify-center w-full">
                  {/* Brand image banner */}
                  <div className="w-full rounded-xl overflow-hidden border border-navy-700/60" style={{ height: '52px' }}>
                    <img
                      src={ad.img}
                      alt={ad.brand}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Tag pill */}
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                    style={{ color: ad.brandColor, backgroundColor: ad.brandColorLight, borderColor: ad.brandColorBorder }}
                  >
                    {ad.tag}
                  </span>

                  {/* Text */}
                  <p className="text-sm font-extrabold text-white leading-tight text-center">{ad.title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed text-center">{ad.desc}</p>

                  {/* CTA */}
                  <button
                    className="mt-1 px-5 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: ad.brandColor }}
                  >
                    {ad.cta}
                  </button>
                </div>

                {/* Progress dots */}
                <div className="relative z-10 flex items-center gap-1.5 mt-2">
                  {ADS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setFading(true); setTimeout(() => { setAdIndex(i); setFading(false); }, 400); }}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === adIndex ? '20px' : '6px',
                        height: '6px',
                        backgroundColor: i === adIndex ? ad.brandColor : '#334155',
                      }}
                    />
                  ))}
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy-700">
                  <div
                    key={adIndex}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: ad.brandColor,
                      animation: fading ? 'none' : 'adProgress 7s linear forwards',
                    }}
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
