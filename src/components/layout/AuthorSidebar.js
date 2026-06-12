'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, User, Settings, Bell, HelpCircle, LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/dashboard',               label: 'Dashboard',          icon: LayoutDashboard },
  { href: '/dashboard/profile',       label: 'Profile',            icon: User },
  { href: '/dashboard/account',       label: 'Account Information',icon: Settings },
  { href: '/dashboard/notifications', label: 'Notifications',      icon: Bell },
  { href: '/dashboard/support',       label: 'Support',            icon: HelpCircle },
];

export default function AuthorSidebar({ open, onClose }) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-navy-900 border-r border-navy-800
        flex flex-col z-50 transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-navy-800 shrink-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
          <p className="font-extrabold text-gold-500 text-sm whitespace-nowrap">Amazon Author Central</p>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-navy-800 shrink-0">
          <div className="flex items-center gap-3 bg-navy-800 rounded-xl p-3">
            {profile?.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt={profile.full_name}
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center shrink-0">
                <span className="text-gold-400 text-sm font-bold">{initials}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile?.full_name || '—'}</p>
              <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <p className="text-xs font-semibold text-navy-600 uppercase tracking-wider px-3 mb-3">Menu</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`nav-link ${active ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-navy-800 shrink-0">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400
                       hover:bg-red-500/10 transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
