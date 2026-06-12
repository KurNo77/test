'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Wallet, LogOut, Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/admin/dashboard',               label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/admin/dashboard/authors',       label: 'Author Management', icon: Users },
  { href: '/admin/dashboard/balance',       label: 'Balance Manager',   icon: Wallet },
  { href: '/admin/dashboard/permissions',   label: 'Roles & Permissions', icon: Lock },
];

export default function AdminSidebar({ open, onClose }) {
  const pathname  = usePathname();
  const { adminSignOut } = useAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

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

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <p className="text-xs font-semibold text-navy-600 uppercase tracking-wider px-3 mb-3">Admin Menu</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin/dashboard' ? pathname === href : pathname.startsWith(href);
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
            onClick={adminSignOut}
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
